import React, { FunctionComponent, useContext, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Message, MessageImage } from 'react-native-gifted-chat';
import { AntDesign, Feather } from "react-native-vector-icons";
import * as FileSystem from 'expo-file-system';
import { Audio, Video } from 'expo-av';
import { UserContext } from '../../Auth/Login';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';

//style sheet
const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'column'
    },
    itemIn: {
        alignSelf: 'flex-start',
        marginLeft: 10
    },
    itemOut: {
        alignSelf: 'flex-end',
        marginRight: 10
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
    onLongPress: (id: string) => any
}

const CustomMessage:FunctionComponent<CustomMessageProps> = (props) => {
    const { children, uploadProgress, onLongPress } = props;
    const { user } = useContext(UserContext);
    const [messagePressed, setMessagePressed] = useState<boolean>(false);
    const [sound, setSound] = useState();

    const playSound = async (uri: string) => {
        const sound = await Audio.Sound.createAsync({ uri: uri });
        setSound(sound);
        await sound.sound.playAsync();
    } 

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
            const downloadResumable = FileSystem.createDownloadResumable(
                uri,
                FileSystem.documentDirectory + filename,
                {}
            );
            await downloadResumable.downloadAsync();
            //TODO: connect download status with notifications
            console.log("download success!");
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <Message 
            {...children}
            key={`${children['currentMessage']['_id']}-${messagePressed}-${uploadProgress}`}
            renderBubble={() => {
                const currentMessage = children['currentMessage']
                const isCurrentUser = currentMessage.user._id === user._id
                
                return (
                    <View style={[styles.item]}>

                        {/* handle texts */}
                        {currentMessage.hasOwnProperty('text') && currentMessage.text.length > 0 &&
                        <>
                            <TouchableOpacity 
                                onPress={() => setMessagePressed(!messagePressed)}
                                onLongPress={() => onLongPress(currentMessage._id)}
                            >     
                            <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#1F4E45' : 'white'}, { borderWidth: isCurrentUser ? null : 1 }]}>
                                <Text style={{paddingTop: 5, color:  isCurrentUser ? 'white' : 'black'}}>{currentMessage.text}</Text>
                            </View>
                            </TouchableOpacity>
                            <>
                            {/* {messagePressed && <Text style={{...styles.status, alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'}}>
                                {prepareStatusText(currentMessage.status)}
                            </Text>} */}
                        </></>}

                        {/* handle images */}
                        {currentMessage.hasOwnProperty('image') && currentMessage.image.length > 0 && 
                        (<TouchableOpacity
                            onLongPress={() => onLongPress(currentMessage._id)}
                        >     
                            <MessageImage currentMessage={{...currentMessage, image: currentMessage.location}} />
                        </TouchableOpacity>)}

                        {/* handle videos */}
                        {currentMessage.hasOwnProperty('video') && currentMessage.video.length > 0 &&
                        (<TouchableOpacity
                            onLongPress={() => onLongPress(currentMessage._id)}
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
                        {currentMessage.hasOwnProperty('file') && currentMessage.file.length > 0 &&
                        (<TouchableOpacity
                            onLongPress={() => onLongPress(currentMessage._id)}
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
                        {currentMessage.hasOwnProperty('audio') && currentMessage.audio.length > 0 &&
                        (<TouchableOpacity
                            onLongPress={() => onLongPress(currentMessage._id)}
                        >
                            <View style={[styles.balloon, 
                                    { backgroundColor: isCurrentUser ? '#1F4E45' : 'white' }, 
                                    { borderWidth: isCurrentUser ? null : 1 },
                                    { display: 'flex', flexDirection: 'row' }]}>
                                {sound?.status.isPlaying ?
                                    <AntDesign
                                        name="pausecircleo"
                                        size={20}
                                        color={isCurrentUser ? 'white' : THEME_COLORS.ICON_COLOR}
                                        onPress={() => sound.sound.pauseAsync()}
                                    />
                                    :
                                    <AntDesign
                                        name="play"
                                        size={20}
                                        color={isCurrentUser ? 'white' : THEME_COLORS.ICON_COLOR}
                                        onPress={() => playSound(currentMessage.location)}
                                    />
                                }
                            </View>
                        </TouchableOpacity>)}
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


