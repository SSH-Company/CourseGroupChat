import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { Socket } from '../Util/WebSocket';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type ChatProps = {
    recipientID: {
        id: number,
        name: string,
        avatar: string
    },
    queuedMessages: string
}

const Chat = ({ route, navigation }) => {

    const userID = useContext(UserContext)
    const { recipientID, queuedMessages } = route.params as ChatProps;
    const [user, setUser] = useState<User>();
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        setUser({
            _id: userID,
            name: 'Test Developer',
            avatar: 'https://placeimg.com/140/140/any'
        })
    }, [])

    useEffect(() => {
        if (queuedMessages) {
            const newMessages = JSON.parse(queuedMessages)
            setMessages(prevMessage => {
                if (prevMessage) return newMessages.concat(prevMessage)
                else return newMessages
            })
        }
    }, [queuedMessages])

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        //submit message to queue
        axios.post(`${BASE_URL}/api/message`, { message: {messages, recipientID: recipientID} })
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


