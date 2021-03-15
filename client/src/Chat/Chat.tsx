import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions, BackHandler } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import * as VideoExtensions from 'video-extensions';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { ChatLog, MessageStatus, revisedRandId } from '../Util/ChatLog';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type ChatProps = {
    groupID: {
        id: number,
        name: string,
        avatar: string
    }
}

const Chat = ({ route, navigation }) => {

    const user = useContext(UserContext)
    const { postStatus, renderFlag, setPostStatus, setRenderFlag } = useContext(RenderMessageContext);
    const { groupID } = route.params as ChatProps;
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        const backAction = () => {
          navigation.navigate('Main');
          return true
        };
    
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
    
        return () => backHandler.remove();
      }, []);

    //re set messages everytime a new message is received from socket
    useEffect(() => {
        resetMessages();
    }, [renderFlag])

    const resetMessages = async () => {
        const instance = await ChatLog.getChatLogInstance();
        const log = instance.chatLog;
        const filteredMessages = log[groupID.id];
        setMessages(filteredMessages);
        if (postStatus) {
            axios.post(`${BASE_URL}/api/message/updateMessageStatus`, { groups: [groupID.id], status: "Read" }).catch(err => console.log(err))
            setPostStatus(false);
        }    
    }
    
    const onSend = useCallback(async (messages = []) => {
        //append to Chatlog instance to save to cache
        //store message ids, set these to pending: true
        for (const msg of messages) msg['status'] = "Pending" as MessageStatus;
        const instance = await ChatLog.getChatLogInstance();
        instance.appendLog(groupID, messages);
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        await sendData(messages);
    }, [])

    //helper function for sending message to queue
    const sendData = async (messages = []) => {
        //here we are assuming only one message is posted at a time
        try {
            const imageType = messages[0].hasOwnProperty('imageData');
            let formData: any;
            if (imageType) {
                formData = new FormData();
                formData.append('media', {...messages[0].imageData});
                formData.append('message', JSON.stringify({ messages, groupID: groupID }))
                await axios.post(`${BASE_URL}/api/message`, formData, { headers: { 'content-type': 'multipart/form-data' } })
            } else {
                formData = { message: JSON.stringify({ messages, groupID: groupID })}
                await axios.post(`${BASE_URL}/api/message`, formData)
            }
            
            const instance = await ChatLog.getChatLogInstance()
            instance.updateMessageStatus(groupID.id, "Sent", messages[0])
            setRenderFlag(!renderFlag);
        } catch (err) {
            //TODO: display failed notification here
            console.error(err);
        }
    }

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
                        imageData: imageRes,
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

    return (
    <View style={{flex: 1}}>
        <DrawerLayout
            drawerWidth={Dimensions.get('window').width}
            drawerPosition={'right'}
            drawerType={'front'}
            drawerBackgroundColor="#ffffff"
            renderNavigationView={InboxSettings}
            contentContainerStyle={{}}
        >   
            <GiftedChat
                user={user}
                messages={messages}
                onSend={messages => onSend(messages)}
                renderMessage={props => { return ( <CustomMessage {...props} /> ) }}
                renderInputToolbar={props => { return ( <CustomToolbar children={props} onImagePick={type => onImagePick(type)} /> ) }}
                isKeyboardInternallyHandled={false}
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


