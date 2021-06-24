import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { ActivityIndicator, Text, View, Dimensions, Clipboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Header } from "react-native-elements";
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog, MessageStatus } from '../Util/ChatLog';
import VerifiedIcon from '../Util/CommonComponents/VerifiedIcon';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleError } from '../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';


const Chat = ({ route, navigation }) => {
    const { user } = useContext(UserContext)
    const { postStatus, renderFlag, setPostStatus } = useContext(RenderMessageContext);
    const [group, setGroup] = useState<any>({
        id: route.params.groupID,
        name: route.params.name || '',
        avatar: route.params.avatar || EMPTY_IMAGE_DIRECTORY,
        verified: route.params.verified || 'N',
        members: route.params.members || []
    });
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newGroup, setNewGroup] = useState<boolean>();
    const [loading, setLoading] = useState(true);
    const { showActionSheetWithOptions } = useActionSheet();
    const drawerRef = useRef(null);
    const giftedChatRef = useRef(null);
    const avatarSize = 25;
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        resetMessages();
        // updateMessageStatus();
    }, [route.params.groupID])

    //re set messages everytime a new message is received from socket
    // useEffect(() => {
    //     resetMessages();
    //     updateMessageStatus();
    // }, [renderFlag]);

    useEffect(() => {
        //this function is only triggered when the view is first loaded
        if (messages.length > 0) {
            appendReceviedMessage();
        }
    }, [renderFlag])

    const filterOutEmptyMessages = (msgs) => {
        return msgs.filter(msg => msg._id && (msg.text?.length > 0 || msg.image?.length > 0 || msg.video?.length > 0 || msg.file?.length > 0 || msg.audio?.length > 0 ));
    }

    // const updateMessageStatus = async () => {
    //     try {
    //         const instance = await ChatLog.getChatLogInstance();
    //         const groupInfo = instance.groupInfo[groupID];
    //         if (groupInfo && (!groupInfo.entered || postStatus)) {
    //             await axios.post(`${BASE_URL}/api/chat/updateMessageStatus`, { groupID: groupID });
    //             instance.updateGroupEntered(groupID, true);
    //             setPostStatus(false);
    //         }
    //     } catch(err) {
    //         console.log(err);
    //     }
    //     return;
    // }

    const appendReceviedMessage = async () => {
        //retrieve last message in this group and append to messages
        try {
            const log = (await ChatLog.getChatLogInstance()).chatLog;
            if (group.id && group.id in log) {
                const lastMessage = log[group.id][0];
                if (Object.keys(lastMessage).length > 0) {
                    setMessages(previousMessages => {
                        const filteredMessages = filterOutEmptyMessages([lastMessage]);
                        return GiftedChat.append(previousMessages, filteredMessages)
                    });
                }
            }
        } catch (err) {
            console.log('Failed to refresh from last received message')
        }
    }

    const resetMessages = async () => {
        try{
            setLoading(true);

            const instance = await ChatLog.getChatLogInstance();
            if (group.id) await instance.refreshGroup(group.id, false, group.name, group.avatar); 
            const log = instance.chatLog;
            
            if (group.id in log) {
                const groupInfo = instance.groupInfo[group.id];
                setGroup({
                    ...group,
                    name: groupInfo.name,
                    avatar: groupInfo.avatar,
                    verified: groupInfo.verified
                });

                //we're filtering here to ensure we can retrieve empty group chats from ChatLog_View, but not render any empty messages
                setMessages(previousMessages => {
                    const messageIds = previousMessages.map(m => m._id);
                    const filteredMessages = filterOutEmptyMessages(log[group.id]).filter(m => !messageIds.includes(m._id));
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
            if (!(group.id in instance.groupInfo)) {
                //create the group in the backend
                const res = await axios.post(`${BASE_URL}/api/search/create-group`, { recipients: group.members });
                const data = res.data;
                //refresh log since new group has been created, and navigate to it
                await ChatLog.getChatLogInstance(true);
                await sendData(messages, {...group, id:data.id });
                navigation.push('Chat', { groupID: data.id, name: data.name })
            } else {
                instance.appendLog(group, messages);
                setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
                await sendData(messages);
            }
        } catch(err) {
            handleError(err);
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
            handleError(err);
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

    const handleLongPress = (id: string, isCurrentUser: boolean, copyString: string | null) => {
        const options = ['Forward Message'];
        if (copyString) options.push('Copy Text');
        if (isCurrentUser) options.push('Delete Message');
        const cancelButtonIndex = options.length - 1;
        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, async (buttonIndex) => {
            switch (buttonIndex) {
                case 0:
                    console.log('forward here');
                    break;
                case 1:
                    if (copyString) Clipboard.setString(copyString) 
                    else if (isCurrentUser) deleteMessage(id)
                    break;
                case 2:
                    deleteMessage(id);
                    break;
            }
        });
    }

    const deleteMessage = async (id: string) => {
        try {
            const reqBody = {
                groupID: group.id,
                messageID: id
            }
            await axios.delete(`${BASE_URL}/api/chat`, { data: reqBody });
            const instance = await ChatLog.getChatLogInstance();
            await instance.refreshGroup(group.id, false, group.name, group.avatar);
            setMessages(filterOutEmptyMessages(instance.chatLog[group.id]));
            return;
        } catch (err) {
            handleError(err)
        }
    }

    const onLoadEarlier = async () => {
        const log = await ChatLog.getChatLogInstance();
        await log.refreshGroup(group.id, true);
        setMessages(previousMessages => {
            const messageIds = previousMessages.map(m => m._id);
            const filteredMessages = filterOutEmptyMessages(log.chatLog[group.id]).filter(m => !messageIds.includes(m._id));
            return GiftedChat.prepend(previousMessages, filteredMessages)
        });
    }

    return (
        <View style={{flex: 1}}>
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
                        statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                        leftComponent={
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <AntDesign 
                                    name="left" 
                                    size={20} 
                                    color={THEME_COLORS.ICON_COLOR}
                                    onPress={() => navigation.navigate('Main')}
                                />
                                <Avatar 
                                    source={{ uri: group.avatar || EMPTY_IMAGE_DIRECTORY }} 
                                    rounded 
                                    size={avatarSize} 
                                    containerStyle={{ marginLeft: 10, borderColor: "white", borderWidth: 1 }}
                                    onPress={() => drawerRef.current.openDrawer()}
                                />        
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
                        leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                        centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                        rightContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                    />
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1, backgroundColor: 'white' }}
                    >
                        <GiftedChat
                            ref={giftedChatRef}
                            user={{
                                _id: user._id,
                                name: user.name,
                                avatar: user.avatar
                            }}
                            messages={messages}
                            onSend={messages => onSend(messages)}
                            renderMessage={props => { return ( 
                                <CustomMessage 
                                    children={props} 
                                    uploadProgress={uploadProgress} 
                                    onLongPress={(id, isCurrentUser, copyString) => handleLongPress(id, isCurrentUser, copyString)} 
                                /> ) }}
                            renderInputToolbar={props => { return ( 
                                <CustomToolbar 
                                    children={props} 
                                    onSend={messages => onSend(messages)}
                                /> ) }}
                            loadEarlier
                            onLoadEarlier={onLoadEarlier}
                            isKeyboardInternallyHandled={false}
                        />
                    </KeyboardAvoidingView>
                </DrawerLayout>
            }
            
        </View>
    )
}

export default Chat


