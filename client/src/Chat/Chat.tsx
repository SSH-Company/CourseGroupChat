import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
<<<<<<< HEAD
import { Socket, ChatLog } from '../Util';
=======
>>>>>>> origin/master
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Util/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type ChatProps = {
    recipientID: {
        id: number,
        name: string,
        avatar: string
    }
}

const Chat = ({ route, navigation }) => {

    const user = useContext(UserContext)
    const renderFlag = useContext(RenderMessageContext);
    const { recipientID } = route.params as ChatProps;
    const [messages, setMessages] = useState<IMessage[]>([]);

    //re set messages everytime a new message is received from socket
    useEffect(() => {
        const log = ChatLog.getChatLog().chatLog
        setMessages(log[recipientID.id])
    }, [renderFlag])

    const onSend = useCallback((messages = []) => {
        //append to Chatlog instance to save to cache
        ChatLog.getChatLog().appendLog(recipientID.id, messages)
        ChatLog.getChatLog().printLog()
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        //submit message to queue
        axios.post(`${BASE_URL}/api/message`, { message: {messages, recipientID: recipientID, senderID: user} })
            .then(() => console.log('Message sent to Queue!'))
            .catch(err => console.error(err))
    }, [])

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
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


