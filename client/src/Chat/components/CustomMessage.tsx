import React, { FunctionComponent, useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Slider, Alert } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Message, MessageImage } from 'react-native-gifted-chat';
import { AntDesign, Feather } from "react-native-vector-icons";
import * as Linking from 'expo-linking';
import { Audio, Video } from 'expo-av';
import { UserContext } from '../../Auth/Login';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { millisToMinutesAndSeconds } from '../../Util/CommonFunctions';
import { EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';

//style sheet
const styles = StyleSheet.create({
    date: {
        fontSize: 12,
        color: 'grey',
        padding: 4
    },
    balloon: {
        maxWidth: 250,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderRadius: 20
    },
    video: {
        minWidth: 200,
        minHeight: 200,
        alignSelf: 'center'
    },
    status: {
        fontSize: 10,
        color: 'grey'
    }
})

type CustomMessageProps = {
    children: any,
    uploadProgress: number,
    onLongPress: (id: string, isCurrentUser: boolean, copyString?: string) => any
}

const CustomMessage:FunctionComponent<CustomMessageProps> = (props) => {
    const { children, uploadProgress, onLongPress } = props;
    const { user } = useContext(UserContext);
    const [messagePressed, setMessagePressed] = useState<boolean>(false);
    
    //States for controlling audio
    const [refreshSound, setRefreshSound] = useState(false);
    const [sound, setSound] = useState<any>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [soundStatus, setSoundStatus] = useState<any>();

    const onPlayBackStatusUpdate = (playbackStatus) => {
        if (!playbackStatus.isLoaded) {
            // Update your UI for the unloaded state
            if (playbackStatus.error) {
              console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`);
            }
        } else {
            setIsPlaying(playbackStatus.isPlaying);
            setPosition(playbackStatus.positionMillis);
        }
    }

    useEffect(() => {
        let mounted = true;

        const loadSound = async () => {
            const uri = children['currentMessage'].location;
            if (uri) {
                try {
                    const sound = await Audio.Sound.createAsync({ uri: uri });
                    const status = await sound.sound.getStatusAsync();
                    setTimeout(() => {
                        if (mounted) {
                            sound.sound.setOnPlaybackStatusUpdate(onPlayBackStatusUpdate);
                            setSoundStatus(status);
                            setSound(sound);
                            setRefreshSound(!refreshSound);
                        }
                    }, 600)
                } catch(err) {
                    console.log(err)
                }
            }
        }

        if (children['currentMessage'].audio?.length > 0) {
            loadSound();
        } else if (sound !== undefined) {
            sound.sound.unloadAsync();
        }

        return () => { mounted = false; }
    }, [])

    /* Text status is buggy af, comment out for now */
    // const prepareStatusText = (status: string) => {
    //     const seenBy = status.split(', ').filter(i => i !== "" && i !== `${user.name.toUpperCase()}`);
    //     if (seenBy.length === 0) return 'Sent';
    //     if (seenBy.length === 1) {
    //         if (['Pending', 'Sent'].includes(seenBy[0])) return seenBy[0];
    //         else return 'Seen';
    //     }
    //     if (seenBy.length > 1) return `Seen by ${status.slice(0, status.length)}`;
    // }

    const downloadFile = async (uri: string, filename: string) => {
        try {
            Alert.alert(
                "Are you sure you want to download?",
                filename,
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    { text: "OK", onPress: () => Linking.openURL(uri) }
                ]
            )
        } catch (err) {
            console.log(err);
        }
    }

    const timeSincePreviousMessage = (curr: string | null, prev: string | null, time: number) => {
        if (prev && curr) {
            //create a seperate block if last time message sent was more than 'time' minutes ago
            return Math.abs(new Date(curr).getTime() - new Date(prev).getTime()) > time 
        } else {
            return false
        }
    }

    const formatAMPM = (date) => {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const localeString = date.toLocaleString('default', { month: 'narrow' }).slice(0, 10);
        var strTime = localeString + " at " + hours + ':' + minutes + ' ' + ampm;
        if (!strTime.includes('Invalid')) return strTime 
        else return null;
    }

    //variables for bubble and avatar
    const currentMessage = children['currentMessage']
    const isCurrentUser = currentMessage.user._id === user._id
    const seperateMessageBlock = timeSincePreviousMessage(currentMessage.createdAt, children['previousMessage'].createdAt, 30 * 1000);
    const newDay = timeSincePreviousMessage(currentMessage.createdAt, children['previousMessage'].createdAt, 24 * 60 * 60 * 1000) || !children['previousMessage']?.hasOwnProperty('createdAt');
    const displayUsername = (children['previousMessage'].user?._id === user._id || seperateMessageBlock) && !isCurrentUser
    const shouldRenderAvatar = (timeSincePreviousMessage(currentMessage.createdAt, children['nextMessage'].createdAt, 30 * 1000) || !children['nextMessage']?.hasOwnProperty('createdAt')) && !isCurrentUser
    
    return (
        <Message 
            {...children}
            currentMessage={{
                ...children.currentMessage,
                user: {
                   ...children.currentMessage.user,
                   avatar: children.currentMessage.user.avatar || EMPTY_IMAGE_DIRECTORY 
                }
            }}
            key={`${children['currentMessage']['_id']}-${messagePressed}-${uploadProgress}-${isPlaying}-${refreshSound}-${position}`}
            renderAvatar={() => {
                return (
                    <Avatar
                        rounded 
                        source={{ uri: shouldRenderAvatar ? children.currentMessage.user.avatar || EMPTY_IMAGE_DIRECTORY : null }} 
                    />
                )
            }}
            renderBubble={() => {
                return (
                    <View style={{ flexDirection: 'column', paddingTop: seperateMessageBlock === true ? 15 : 0, width: isCurrentUser ? '92%' : '80%' }}>
                        {/* {(newDay || messagePressed) && currentMessage.createdAt &&
                            <View style={{ flex: 1, padding: 6, alignSelf: 'center' }}>
                                <Text style={styles.date}>{formatAMPM(new Date(currentMessage.createdAt))}</Text>
                            </View>
                        } */}
                        {displayUsername && <Text style={{ fontSize: 10, alignSelf: 'flex-start', paddingLeft: 12 }}>{currentMessage.user.name}</Text>}
                        <View style={{ flex: 1, flexDirection: 'column', alignSelf: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                            {/* handle texts */}
                            {currentMessage.hasOwnProperty('text') && currentMessage?.text?.length > 0 &&
                            <>
                                <TouchableOpacity 
                                    onPress={() => setMessagePressed(!messagePressed)}
                                    onLongPress={() => onLongPress(currentMessage._id, isCurrentUser, currentMessage.text)}
                                >     
                                    <View style={[styles.balloon, { backgroundColor: isCurrentUser ? '#1F4E45' : 'white' }, { borderWidth: isCurrentUser ? null : 1 }]}>
                                        <Text style={{ paddingTop: 5, color:  isCurrentUser ? 'white' : 'black' }}>{currentMessage.text}</Text>
                                    </View>
                                </TouchableOpacity>
                                <>
                                {/* {messagePressed && <Text style={{...styles.status, alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'}}>
                                    {prepareStatusText(currentMessage.status)}
                                </Text>} */}
                            </></>}

                            {/* handle images */}
                            {currentMessage.hasOwnProperty('image') && currentMessage?.image?.length > 0 && 
                            (<TouchableOpacity
                                onLongPress={() => onLongPress(currentMessage._id, isCurrentUser)}
                            >     
                                <MessageImage currentMessage={{...currentMessage, image: currentMessage.location}} />
                            </TouchableOpacity>)}

                            {/* handle videos */}
                            {currentMessage.hasOwnProperty('video') && currentMessage?.video?.length > 0 &&
                            (<TouchableOpacity
                                onLongPress={() => onLongPress(currentMessage._id, isCurrentUser)}
                            >
                                <Video
                                    style={styles.video}
                                    source={{ uri: currentMessage.location }}
                                    //TODO: find a good way to display loading icon
                                    // usePoster
                                    // posterSource={{ uri: `${BASE_URL}/media/loading_icon.jpg` }} 
                                    useNativeControls
                                    resizeMode="cover"
                                    isLooping
                                />
                            </TouchableOpacity>)}

                            {/* handle files */}
                            {currentMessage.hasOwnProperty('file') && currentMessage?.file?.length > 0 &&
                            (<TouchableOpacity
                                onLongPress={() => onLongPress(currentMessage._id, isCurrentUser)}
                            >
                                <View style={[styles.balloon, 
                                        { backgroundColor: isCurrentUser ? '#1F4E45' : 'white' }, 
                                        { borderWidth: isCurrentUser ? null : 1 },
                                        { display: 'flex', flexDirection: 'row' }]}>
                                    <Feather
                                        name="download"
                                        size={20}
                                        color={isCurrentUser ? 'white' : THEME_COLORS.ICON_COLOR}
                                        onPress={() => downloadFile(currentMessage.location, currentMessage.file)}
                                    />
                                    <Text style={{marginLeft: 10, paddingTop: 5, color:  isCurrentUser ? 'white' : 'black', textDecorationLine: 'underline'}}>{currentMessage.file}</Text>
                                </View>
                            </TouchableOpacity>)}

                            {/* handle audio */}
                            {currentMessage.hasOwnProperty('audio') && currentMessage?.audio?.length > 0 &&
                            (<TouchableOpacity
                                onPress={() => isPlaying ? sound?.sound.pauseAsync() : sound?.sound.playAsync()}
                                onLongPress={() => onLongPress(currentMessage._id, isCurrentUser)}
                            >
                                <View style={[styles.balloon, 
                                        { backgroundColor: isCurrentUser ? '#1F4E45' : 'white', width: 200 }, 
                                        { borderWidth: isCurrentUser ? null : 1 },
                                        { display: 'flex', flexDirection: 'row' }]}>
                                    {isPlaying ?
                                        <AntDesign
                                            name="pausecircleo"
                                            size={30}
                                            color={isCurrentUser ? 'white' : THEME_COLORS.ICON_COLOR}
                                            onPress={async () => await sound.sound.pauseAsync()}
                                        />
                                        :
                                        <AntDesign
                                            name="play"
                                            size={30}
                                            color={isCurrentUser ? 'white' : THEME_COLORS.ICON_COLOR}
                                            onPress={async () => await sound.sound.playAsync()}
                                        />
                                    }
                                    {sound !== undefined &&
                                        <>
                                            <Slider
                                                minimumValue={0}
                                                maximumValue={Math.max(soundStatus.durationMillis, 1, position + 1)}
                                                value={position}
                                                onValueChange={async e => await sound.sound.setPositionAsync(e)}
                                                step={1}
                                                style={{ width: 100 }}
                                            />
                                            <Text style={{ color: isCurrentUser ? 'white' : 'black', alignSelf: 'center' }}>{millisToMinutesAndSeconds(soundStatus.durationMillis - position)}</Text>
                                        </>
                                    }
                                </View>
                            </TouchableOpacity>)}
                        </View>
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


