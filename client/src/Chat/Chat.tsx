import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Dimensions, BackHandler } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
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
    const { renderFlag, setRenderFlag } = useContext(RenderMessageContext);
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
        const log = ChatLog.getChatLogInstance().chatLog
        setMessages(log[groupID.id])
    }, [renderFlag])

    const onSend = useCallback((messages = []) => {
        //append to Chatlog instance to save to cache
        ChatLog.getChatLogInstance().appendLog(groupID, messages)
        setRenderFlag(!renderFlag)
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        //submit message to queue
        sendData(messages)
    }, [])

    const sendData = (messages = []) => {
        axios.post(`${BASE_URL}/api/message`, { message: {messages, groupID: groupID, senderID: user} })
            .then(() => console.log('Message sent to Queue!'))
            .catch(err => console.error(err))
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
            />
        </DrawerLayout>
    </View>
    )
}

export default Chat


