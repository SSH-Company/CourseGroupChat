import React, { FunctionComponent, useState, useCallback, useEffect } from 'react'
import { View, Dimensions, Platform } from 'react-native'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, ChatSettings } from './components'

const Chat:FunctionComponent = () => {
    const [messages, setMessages] = useState<IMessage[]>([]);

    //Device width
    let deviceWidth = Dimensions.get('window').width

    useEffect(() => {
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
    }, [])

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [])

    return (
    <View style={{flex: 1}}>
        <DrawerLayout
            drawerWidth={deviceWidth}
            drawerPosition={'right'}
            drawerType={'front'}
            drawerBackgroundColor="#ffffff"
            renderNavigationView={ChatSettings}
            contentContainerStyle={{}}
        >
            <GiftedChat
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


