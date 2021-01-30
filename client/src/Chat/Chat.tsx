import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { Socket } from '../Util/WebSocket';
import { UserContext } from '../Auth/Login';
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

    const userID = useContext(UserContext)
    const { recipientID } = route.params as ChatProps;
    const [user, setUser] = useState<User>();
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        requestData()
        websocketConnect()
    }, [])

    //WebSocket connection
    const websocketConnect = () => {
        const socket = Socket.getSocket(userID).socket

        socket.onmessage = (e: any) => {
            const data = JSON.parse(e.data)
            if (userID !== recipientID.id) {
                const newMessage:any = [{
                    _id: data._id,
                    text: data.text,
                    createdAt: new Date(),
                    user: {
                        _id: recipientID.id,
                        name: recipientID.name,
                        avatar: recipientID.avatar
                    }
                }]
                setMessages(prevMessage => newMessage.concat(prevMessage))
            }
        }

        return () => {
            socket.close();
        }
    }

    //Device width
    let deviceWidth = Dimensions.get('window').width

    const requestData = () => {
        setMessages([
            {
                _id: 2000,
                text: 'Hello developer',
                createdAt: new Date(),
                user: {
                    _id: recipientID.id,
                    name: recipientID.name,
                    avatar: recipientID.avatar,
                },
            },
        ])
        setUser({
            _id: userID,
            name: 'Test Developer',
            avatar: 'https://placeimg.com/140/140/any'
        })
    }

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
            drawerWidth={deviceWidth}
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
                renderMessage={props => { return ( <CustomMessage {...props} uniqueUserId={userID}/> ) }}
                renderInputToolbar={props => { return ( <CustomToolbar {...props} /> ) }}
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


