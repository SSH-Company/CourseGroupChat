import React, { FunctionComponent, useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { InputToolbar, Send } from 'react-native-gifted-chat';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoExtensions from 'video-extensions';
import { handleImagePick, handlePermissionRequest } from "../../Util/ImagePicker";
import { revisedRandId } from '../../Util/ChatLog';
import { UserContext } from '../../Auth/Login';
import { Entypo, SimpleLineIcons, Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';

const style = StyleSheet.create({
    outerContainer: {
        display:'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    innerContainer: { 
        display: 'flex',
        flex: 1,
        flexDirection:'row',
        marginBottom: 8 
    },
    //input toolbar
    inputbar: {
        backgroundColor: '#f0f0f0',
        alignSelf: 'flex-end',
        borderTopWidth: 0,
        borderRadius: 30,
        marginRight: 10
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
                    const mediaType = (VideoExtensions as any).default.includes(fileExtension) ? "video" : "image";
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
            if (res) {
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
        <View style={[{...style.outerContainer, position: isTyping ? 'relative' : 'absolute', bottom: isTyping ? null : 1 }]}>
            <InputToolbar 
                {...children} 
                containerStyle={{...style.inputbar, marginLeft: isTyping ? 10 : 110}}
                renderSend={() => 
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
                        />
                }
            />
            {!isTyping && 
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
            </View>}
            
        </View>
    )
}

export default CustomToolbar


