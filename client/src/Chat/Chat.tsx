import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { ActivityIndicator, Text, View, Dimensions } from 'react-native';
import { Avatar, Header } from "react-native-elements";
import { StatusBar } from 'expo-status-bar';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog, MessageStatus } from '../Util/ChatLog';
import VerifiedIcon from '../Util/CommonComponents/VerifiedIcon';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const Chat = ({ route, navigation }) => {
    const { user } = useContext(UserContext)
    const { postStatus, renderFlag, setPostStatus } = useContext(RenderMessageContext);
    const { groupID, name, avatar, verified, members } = route.params;
    const [group, setGroup] = useState<any>({
        id: groupID,
        name: name || '',
        avatar: avatar || EMPTY_IMAGE_DIRECTORY,
        verified: verified || 'N',
        members: members || []
    });
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newGroup, setNewGroup] = useState<boolean>();
    const [loading, setLoading] = useState(true);
    const { showActionSheetWithOptions } = useActionSheet();
    const isFocused = useIsFocused();
    const drawerRef = useRef(null);
    const giftedChatRef = useRef(null);
    const avatarSize = 25;
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        if (groupID) {
            resetMessages(true);
            updateMessageStatus();
        }
    }, [isFocused, groupID])

    //re set messages everytime a new message is received from socket
    useEffect(() => {
        resetMessages();
        updateMessageStatus();
    }, [renderFlag]);
    
    const filterOutEmptyMessages = (msgs) => {
        return msgs.filter(msg => msg._id && (msg.text?.length > 0 || msg.image?.length > 0 || msg.video?.length > 0 || msg.file?.length > 0 || msg.audio?.length > 0 ));
    }

    const updateMessageStatus = async () => {
        try {
            const instance = await ChatLog.getChatLogInstance();
            const groupInfo = instance.groupInfo[groupID];
            if (groupInfo && (!groupInfo.entered || postStatus)) {
                await axios.post(`${BASE_URL}/api/chat/updateMessageStatus`, { groupID: groupID });
                instance.updateGroupEntered(groupID, true);
                setPostStatus(false);
            }
        } catch(err) {
            console.log(err);
        }
        return;
    }

    const resetMessages = async (refreshSource: boolean = false) => {
        try{
            setLoading(true);

            const instance = await ChatLog.getChatLogInstance();

            if (groupID && refreshSource) {
                await instance.refreshGroup(groupID, false, name, avatar); 
            }

            const log = instance.chatLog;

            if (groupID in log) {
                const groupInfo = instance.groupInfo[groupID];
                setGroup({
                    ...group,
                    name: groupInfo.name,
                    avatar: groupInfo.avatar,
                    verified: groupInfo.verified
                });
                
                //we're filtering here to ensure we can retrieve empty group chats from ChatLog_View, but not render any empty messages
                setMessages(previousMessages => {
                    const messageIds = previousMessages.map(m => m._id);
                    const filteredMessages = filterOutEmptyMessages(log[groupID]).filter(m => !messageIds.includes(m._id));
                    return GiftedChat.append(previousMessages, filteredMessages)
                });
                setNewGroup(false);   
            } else {
                setNewGroup(true);
                setMessages([]);
            };
        
            setLoading(false);
        
        } catch (err) {
            return;
        }
    }
    
    const onSend = useCallback(async (messages = []) => {
        try {
            //append to Chatlog instance to save to cache
            //store message ids, set these to pending: true
            for (const msg of messages) msg['status'] = "Pending" as MessageStatus;
            const instance = await ChatLog.getChatLogInstance();

            if (!(groupID in instance.groupInfo)) {
                //create the group in the backend
                const res = await axios.post(`${BASE_URL}/api/search/create-group`, { recipients: members });
                const data = res.data;
                setGroup({
                    ...group,
                    groupID: data.id,
                    name: data.name
                });
                setNewGroup(false);
                instance.appendLog({ ...group, id: data.id, name: data.name }, messages);
                setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
                await sendData(messages, {...group, id:data.id });
            } else {
                instance.appendLog(group, messages);
                setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
                await sendData(messages);
            }

        } catch(err) {
            console.error(err);
        }
    }, [])

    //helper function for sending message to queue
    const sendData = async (messages = [], newGroup = group) => {
        //here we are assuming only one message is posted at a time
        try {
            const fileType = messages[0].hasOwnProperty('fileData') || messages[0].hasOwnProperty('imageData');
            let formData: any;
            if (fileType) {
                formData = new FormData();
                formData.append('media', {...messages[0].fileData});
                formData.append('message', JSON.stringify({ messages, groupID: newGroup }))
                await axios.post(`${BASE_URL}/api/chat`, 
                    formData, 
                    {   headers: { 
                            accept: "application/json",
                            'Content-Type': 'multipart/form-data' 
                        }
                    }
                )
            } else {
                formData = { message: JSON.stringify({ messages, groupID: newGroup })}
                await axios.post(`${BASE_URL}/api/chat`, formData)
            }
            const instance = await ChatLog.getChatLogInstance();
            // instance.updateMessageStatus(groupID, "Sent", messages[0]);
            //update the messages
            setMessages(filterOutEmptyMessages(instance.chatLog[newGroup.id]));
        } catch (err) {
            //TODO: display failed notification here
            console.error(err);
        }
    }

    // const handleJoinGroup = async () => {
    //     try {
    //         await axios.post(`${BASE_URL}/api/chat/join-group`, { id: groupID, name: group.name })
    //         resetMessages(true);
    //     } catch (err) {
    //         console.log('unable to join group');
    //         console.error(err);
    //     }
    // }

    const handleLongPress = (id: string) => {
        const options = ['Remove message', 'Edit message'];
        const cancelButtonIndex = options.length - 1;
        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, async (buttonIndex) => {
            switch (buttonIndex) {
                case 0:
                    const reqBody = {
                        groupID: groupID,
                        messageID: id
                    }
                    await axios.delete(`${BASE_URL}/api/chat`, { data: reqBody });
                    resetMessages(true);
                    break;
                case 1:
                    console.log('edit here');
                    break;
            }
        });
    }

    const onLoadEarlier = async () => {
        const log = await ChatLog.getChatLogInstance();
        await log.refreshGroup(groupID, true);
        setMessages(previousMessages => {
            const messageIds = previousMessages.map(m => m._id);
            const filteredMessages = filterOutEmptyMessages(log.chatLog[groupID]).filter(m => !messageIds.includes(m._id));
            return GiftedChat.prepend(previousMessages, filteredMessages)
        });}

    return (
        <View style={{flex: 1}}>
            <StatusBar style="light" backgroundColor={THEME_COLORS.STATUS_BAR}/>
            {loading ?
                <ActivityIndicator />
                :
                <DrawerLayout
                    ref={drawerRef}
                    drawerWidth={Dimensions.get('window').width}
                    drawerPosition={'right'}
                    drawerType={'front'}
                    drawerBackgroundColor="#ffffff"
                    renderNavigationView={() => 
                        InboxSettings({
                            group: { _id: group.id, name: group.name, avatar: group.avatar },
                            onLeaveGroup: () => navigation.navigate('Main')
                        })}
                    contentContainerStyle={{}}
                >   
                    <Header
                        placement="left"
                        backgroundColor={THEME_COLORS.HEADER}
                        leftComponent={
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <Ionicons 
                                    name="arrow-back-sharp" 
                                    size={avatarSize} 
                                    color={THEME_COLORS.ICON_COLOR}
                                    onPress={() => navigation.navigate('Main')}
                                />
                                <Avatar 
                                    source={{ uri: group.avatar || EMPTY_IMAGE_DIRECTORY }} 
                                    rounded 
                                    size={avatarSize} 
                                    containerStyle={{ marginLeft: 10, borderColor: "white", borderWidth: 1 }}/>        
                            </View>
                        }
                        centerComponent={
                            <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: THEME_COLORS.ICON_COLOR, fontSize: 17 }}>{`${group.name}`}</Text>
                                {group.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                            </View>
                        }
                        rightComponent={
                            !newGroup && <Ionicons 
                                name="information-circle-outline" 
                                size={avatarSize} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => drawerRef.current.openDrawer()}
                            />
                        }
                    />
                    <GiftedChat
                        ref={giftedChatRef}
                        user={user}
                        messages={messages}
                        onSend={messages => onSend(messages)}
                        renderMessage={props => { return ( 
                            <CustomMessage 
                                children={props} 
                                uploadProgress={uploadProgress} 
                                onLongPress={id => handleLongPress(id)} 
                            /> ) }}
                        renderInputToolbar={props => { return ( 
                            <CustomToolbar 
                                children={props} 
                                onSend={messages => onSend(messages)}
                            /> ) }}
                        isKeyboardInternallyHandled={true}
                        loadEarlier
                        onLoadEarlier={onLoadEarlier}
                    />
                </DrawerLayout>
            }
            
        </View>
    )
}

export default Chat


