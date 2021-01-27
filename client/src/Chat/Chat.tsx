import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

const Chat:FunctionComponent = () => {

    useEffect(() => {
        requestData()
        websocketConnect()
    }, [])

    //WebSocket connection
    const websocketConnect = () => {
        const socket = new WebSocket('ws://192.168.0.124:3000');
        
        socket.onopen = () => {
            socket.send('something');
        }

        socket.onmessage = (e: any) => {
            console.log(e.data)
        }
        
        socket.onerror = (e: any) => {
            console.log(e.message);
        }
    }

    const UNIQUE_USER_ID = 250;
    const [user, setUser] = useState<User>();
    const [messages, setMessages] = useState<IMessage[]>([]);

    //Device width
    let deviceWidth = Dimensions.get('window').width

    const requestData = () => {
        setMessages([
            {
                _id: 1,
                text: 'Hello developer',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://placeimg.com/140/138/any',
                },
            },
        ])
        setUser({
            _id: UNIQUE_USER_ID,
            name: 'Test Developer',
            avatar: 'https://placeimg.com/140/140/any'
        })
    }

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        //submit message to queue
        axios.post(`${BASE_URL}/api/message`, { message: messages }).catch(err => console.error(err))
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
                renderMessage={props => { return ( <CustomMessage {...props} uniqueUserId={UNIQUE_USER_ID}/> ) }}
                renderInputToolbar={props => { return ( <CustomToolbar {...props} /> ) }}
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


