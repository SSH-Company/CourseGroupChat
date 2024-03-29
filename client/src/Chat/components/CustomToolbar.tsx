import React, { FunctionComponent, useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { InputToolbar, Send } from 'react-native-gifted-chat';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoExtensions from 'video-extensions';
import { handleImagePick, handlePermissionRequest, IMAGE_EXTENSIONS } from "../../Util/ImagePicker";
import { UserContext } from '../../Auth/Login';
import { Entypo, SimpleLineIcons, Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { millisToMinutesAndSeconds, revisedRandId } from '../../Util/CommonFunctions';

const style = StyleSheet.create({
    outerContainer: {
        display:'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    innerContainer: { 
        flexDirection:'row',
        marginRight: 10,
        marginBottom: 15
    },
    //input toolbar
    inputbar: {
        backgroundColor: '#f0f0f0',
        borderTopWidth: 0,
        borderRadius: 30,
        marginRight: 10,
        marginBottom: 5
    },
    //button icons
    actionIcon: {
        marginLeft: 10,
        alignSelf: 'flex-start',
    },
    clipIcon: {
        marginLeft: 10,
        alignSelf: 'flex-start'
    }
})

type CustomToolbarProps = {
    children: any,
    onSend: (message: any) => any
}

const CustomToolbar:FunctionComponent<CustomToolbarProps> = (props) => {
    let {
        children,
        onSend = (message) => {}
    } = props;

    const { user } = useContext(UserContext);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState<any>();
    const [timer, setTimer] = useState(0);


    useEffect(() => {
        //max duration is 3 minutes
        if (((timer / 60000) >= 3) && recording) {
            stopRecording(true);
            return;
        }
    }, [timer, recording])

    const startRecording = async () => {
        try {
            setIsRecording(true);
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            }); 
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await recording.startAsync();
            recording.setOnRecordingStatusUpdate(recordingStatus => setTimer(recordingStatus.durationMillis)); 
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
    
    const stopRecording = async (send: boolean) => {
        setRecording(undefined);
        if (recording) {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setIsRecording(false);
            if (send) {
                const newMessage = {
                    _id: revisedRandId(),
                    createdAt: Date.now(),
                    audio: uri,
                    location: uri,
                    fileData: {
                        name: `audio-recording-${user._id}`,
                        type: "audio/mp3",
                        uri: uri
                    },
                    subtitle: `You sent an audio clip.`,
                    user: user
                }
                onSend([newMessage])
            }
        }
    }

    useEffect(() => {
        setIsTyping(children.text.length > 0)
    }, [children.text])

    const onImagePick = async (type) => {
        try {
            const status = await handlePermissionRequest(type);
            if (status === "granted") {
                const imageRes = await handleImagePick(type);
                if (imageRes) {
                    const fileExtension = imageRes.type.split('/')[1];
                    let mediaType = '';
                    if (IMAGE_EXTENSIONS.includes(fileExtension)) mediaType = "image"
                    else if ((VideoExtensions as any).default.includes(fileExtension)) mediaType = "video"
                    else {
                        Alert.alert(
                            `Failed to upload file`,
                            `Sorry, this file format is not supported.`,
                            [{ text: "OK", style: "cancel" }]
                        )
                        return;
                    }
                    const newMessage = {
                        _id: revisedRandId(),
                        createdAt: Date.now(),
                        [mediaType]: imageRes.uri,
                        location: imageRes.uri,
                        fileData: imageRes,
                        displayStatus: true,
                        subtitle: `You sent a photo`,
                        user: user
                    }
                    onSend([newMessage]);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    const onDocumentPick = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({type: '*/*'})
            var regex = /(?:\.([^.]+))?$/;
            if (res.hasOwnProperty('size') && res['size'] > 0) {
                //check file size
                const sizeInMB = Number((res['size'] / (1024 * 1024)).toFixed(2))
                
                if (sizeInMB > 25) {
                    Alert.alert(
                        'Failed to upload files',
                        'The file you have selected is too large. The maximum size is 25MB.',
                        [{ text: 'Close', style: 'destructive' }]
                    )
                    return;
                }

                const newMessage = {
                    _id: revisedRandId(),
                    createdAt: Date.now(),
                    file: res['name'],
                    fileData: {...res, type: `application/${regex.exec(res['name'])[1]}`},
                    location: res['uri'],
                    displayStatus: true,
                    subtitle: `You sent a file`,
                    user: user
                }
                onSend([newMessage])
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <View style={[{...style.outerContainer, position: !isRecording && isTyping ? 'relative' : 'absolute', bottom: !isRecording && isTyping ? null : 1 }]}>
            {isRecording ?
                <View style={[style.innerContainer]}>
                    <Ionicons 
                        name={'trash-outline'} 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        style={style.clipIcon}
                        onPress={() => stopRecording(false)}
                    />
                </View>
                :
                !isTyping && 
                <View style={[style.innerContainer]}>
                    <Entypo 
                        name={'image'} 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        style={style.clipIcon}
                        onPress={() => onImagePick("library")}
                    />
                    <SimpleLineIcons 
                        name={'camera'} 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        style={style.actionIcon}
                        onPress={() => onImagePick("camera")}
                    />
                    <SimpleLineIcons 
                        name={'paper-clip'} 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        style={style.actionIcon}
                        onPress={() => onDocumentPick()}
                    />
                </View>
            }
            <TouchableOpacity style={{ display: 'flex', flex: 1 }}>
                <InputToolbar 
                    {...children} 
                    placeholder={isRecording ? millisToMinutesAndSeconds(timer) : 'Type a message...'}
                    containerStyle={style.inputbar}
                    renderSend={() => 
                        isRecording ?
                            <MaterialCommunityIcons 
                                name={'send-circle'} 
                                color={THEME_COLORS.ICON_COLOR} 
                                size={40} 
                                onPress={() => stopRecording(true)}
                            />
                            :
                        isTyping ?
                            <Send {...children}>
                                <MaterialCommunityIcons 
                                    name={'send-circle'} 
                                    color={THEME_COLORS.ICON_COLOR} 
                                    size={40} 
                                />
                            </Send>
                                :
                            <Ionicons 
                                name={'mic-circle'} 
                                color={THEME_COLORS.ICON_COLOR} 
                                size={40} 
                                onPress={() => startRecording()}
                            />
                    }
                />
            </TouchableOpacity>
        </View>
    )
}

export default CustomToolbar


