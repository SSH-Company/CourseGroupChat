import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions, BackHandler } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
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
        const filteredMessages = log[groupID.id].filter(msg => msg.text !== '' || msg.image !== '');
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
        sendData(messages);
    }, [])

    //helper function for sending message to queue
    const sendData = (messages = []) => {
        //here we are assuming only one message is posted at a time
        const formData = new FormData();
        formData.append('photo', {...messages[0].imageData});
        formData.append('message', JSON.stringify({ messages, groupID: groupID }))

        axios.post(`${BASE_URL}/api/message`, formData, { headers: { 'content-type': 'multipart/form-data' } })
            .then(async () => {
                const instance = await ChatLog.getChatLogInstance()
                instance.updateMessageStatus(groupID.id, "Sent", messages[0])
                setRenderFlag(!renderFlag);
            })
            .catch(err => {
                console.error(err)

                //TODO: figure out a way to display failed notification
            })
    }

    const onImagePick = async () => {
        try {
            const status = await handlePermissionRequest();
            if (status === "granted") {
                const imageRes = await handleImagePick();
                const newMessage = {
                    _id: revisedRandId(),
                    createdAt: Date.now(),
                    displayStatus: true,
                    image: imageRes.uri,
                    imageData: imageRes,
                    user: user
                }
                onSend([newMessage]);
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
                renderInputToolbar={props => { return ( <CustomToolbar children={props} onImagePick={onImagePick} /> ) }}
                isKeyboardInternallyHandled={false}
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


