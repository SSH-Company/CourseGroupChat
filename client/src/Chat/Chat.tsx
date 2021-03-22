import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { Text, View, Dimensions, BackHandler } from 'react-native';
import { Avatar, Button, Header } from "react-native-elements";
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { Ionicons } from "react-native-vector-icons";
import * as VideoExtensions from 'video-extensions';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { ChatLog, MessageStatus, revisedRandId } from '../Util/ChatLog';
import VerifiedIcon from '../Util/VerifiedIcon';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type ChatProps = {
    groupID: {
        id: string,
        name: string,
        avatar: string,
        verified: 'Y' | 'N'
    }
}

const Chat = ({ route, navigation }) => {

    const user = useContext(UserContext)
    const { postStatus, renderFlag, setPostStatus, setRenderFlag } = useContext(RenderMessageContext);
    const { groupID } = route.params as ChatProps;
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newGroup, setNewGroup] = useState<boolean>();
    const drawerRef = useRef(null);
    const avatarSize = 25;

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

        if (groupID.id in log) {
            //we're filtering here to ensure we can retrieve empty group chats, but not render any empty messages
            const filteredMessages = log[groupID.id].filter(msg => msg.text !== '' || msg.image !== '' || msg.video !== '')
            setMessages(filteredMessages);
            setNewGroup(false);
            if (postStatus) {
                axios.post(`${BASE_URL}/api/message/updateMessageStatus`, { groups: [groupID.id], status: "Read" }).catch(err => console.log(err))
                setPostStatus(false);
            }   
        } else {
            setNewGroup(true);
            setMessages([]);
        };
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

    const handleJoinGroup = async () => {
        try {
            await axios.post(`${BASE_URL}/api/group/join-group`, { id: groupID.id, name: groupID.name })
            await ChatLog.getChatLogInstance(true);
            setRenderFlag(!renderFlag);
        } catch (err) {
            console.log('unable to join group');
            console.error(err);
        }
    }

    return (
    <View style={{flex: 1}}>
        <DrawerLayout
            ref={drawerRef}
            drawerLockMode={newGroup ? 'locked-closed' : 'unlocked'}
            drawerWidth={Dimensions.get('window').width}
            drawerPosition={'right'}
            drawerType={'front'}
            drawerBackgroundColor="#ffffff"
            renderNavigationView={() => 
                InboxSettings({
                    group: { _id: groupID.id, name: groupID.name, avatar: groupID.avatar },
                    onLeaveGroup: async () => {
                        await ChatLog.getChatLogInstance(true);
                        setRenderFlag(!renderFlag);
                        navigation.navigate('Main');
                    }
                })}
            contentContainerStyle={{}}
        >   
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent={
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Ionicons 
                            name="arrow-back-sharp" 
                            size={avatarSize} 
                            color="#734f96" 
                            onPress={() => navigation.navigate('Main')}
                        />
                        <Avatar source={{ uri: groupID.avatar }} rounded size={avatarSize} containerStyle={{ marginLeft: 10, borderColor: "white", borderWidth: 1 }}/>        
                    </View>
                }
                centerComponent={
                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: "#734f96", fontSize: 17 }}>{`${groupID.name}`}</Text>
                        {groupID.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                    </View>
                }
                rightComponent={
                    <Ionicons 
                        name="information-circle-outline" 
                        size={avatarSize} 
                        color="#734f96" 
                        onPress={() => drawerRef.current.openDrawer()}
                    />
                }
            />
            {newGroup ? 
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                    <Button title={`Join ${groupID.name}`} onPress={handleJoinGroup}/>
                </View>
                :
                <GiftedChat
                    user={user}
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    renderMessage={props => { return ( <CustomMessage {...props} /> ) }}
                    renderInputToolbar={props => { return ( <CustomToolbar children={props} onImagePick={type => onImagePick(type)} /> ) }}
                    isKeyboardInternallyHandled={false}
                />
            }
        </DrawerLayout>
    </View>
    )
}

export default Chat


