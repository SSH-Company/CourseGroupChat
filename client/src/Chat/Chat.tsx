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

        //step 3: collect message ids and send them to backend to update DB
    }, [renderFlag])

    const onSend = useCallback((messages = []) => {
        //append to Chatlog instance to save to cache

        //store message ids, set these to pending: true
        for (const msg of messages) {
            msg['status'] = "Pending";
        }

        ChatLog.getChatLogInstance().appendLog(groupID, messages)
        //re renders Main list
        setRenderFlag(!renderFlag)
        
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        //submit message to queue
        sendData(messages)
    }, [])

    const sendData = (messages = []) => {
        axios.post(`${BASE_URL}/api/message`, { message: {messages, groupID: groupID, senderID: user} })
            .then(() => {
                const instance = ChatLog.getChatLogInstance()
                instance.updateMessageStatus(groupID.id, messages[0])
                setMessages(instance.chatLog[groupID.id])
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


