import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions, BackHandler } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog, MessageStatus } from '../Util/ChatLog';
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

    const { user, setUser } = useContext(UserContext)
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
        const filteredMessages = log[groupID.id].filter(msg => msg.text !== '');
        setMessages(filteredMessages);
        if (postStatus) {
            axios.post(`${BASE_URL}/api/message/updateMessageStatus`, { groups: [groupID.id], sender: user._id, status: "Read" }).catch(err => console.log(err))
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
        axios.post(`${BASE_URL}/api/message`, { message: {messages, groupID: groupID, senderID: user} })
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
                renderInputToolbar={props => { return ( <CustomToolbar {...props} /> ) }}
                isKeyboardInternallyHandled={false}
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


