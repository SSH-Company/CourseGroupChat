import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { ActivityIndicator, Text, View, Dimensions, BackHandler } from 'react-native';
import { Avatar, Button, Header } from "react-native-elements";
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as VideoExtensions from 'video-extensions';
import { CustomMessage, CustomToolbar, InboxSettings } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { ChatLog, MessageStatus, revisedRandId } from '../Util/ChatLog';
import VerifiedIcon from '../Util/CommonComponents/VerifiedIcon';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

const Chat = ({ route, navigation }) => {
    const { user } = useContext(UserContext)
    const { postStatus, renderFlag, setPostStatus } = useContext(RenderMessageContext);
    const { groupID, name, avatar, verified } = route.params;
    const [group, setGroup] = useState<any>({
        id: groupID,
        name: name || '',
        avatar: avatar || EMPTY_IMAGE_DIRECTORY,
        verified: verified || 'N'
    });
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [newGroup, setNewGroup] = useState<boolean>();
    const [loading, setLoading] = useState(true);
    const { showActionSheetWithOptions } = useActionSheet();
    const isFocused = useIsFocused();
    const drawerRef = useRef(null);
    const giftedChatRef = useRef(null);
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

    useEffect(() => {
        resetMessages(true);
        updateMessageStatus();
    }, [isFocused, groupID])

    //re set messages everytime a new message is received from socket
    useEffect(() => {
        resetMessages();
        updateMessageStatus();
    }, [renderFlag]);
    
    const filterOutEmptyMessages = (msgs) => {
        return msgs.filter(msg => msg._id && (msg.text?.length > 0 || msg.image?.length > 0 || msg.video?.length > 0 ));
    }

    const updateMessageStatus = async () => {
        try {
            const instance = await ChatLog.getChatLogInstance();
            const groupInfo = instance.groupInfo[groupID];
            if (groupInfo && (!groupInfo.entered || postStatus)) {
                await axios.post(`${BASE_URL}/api/chat/updateMessageStatus`, { groupID: groupID }, { headers: { withCredentials: true } });
                instance.updateGroupEntered(groupID, true);
                setPostStatus(false);
            }
        } catch(err) {
            console.error(err);
        }
        return;
    }

    const resetMessages = async (refreshSource: boolean = false) => {
        setLoading(true);

        const instance = await ChatLog.getChatLogInstance();

        if (refreshSource) {
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
    }
    
    const onSend = useCallback(async (messages = []) => {
        //append to Chatlog instance to save to cache
        //store message ids, set these to pending: true
        for (const msg of messages) msg['status'] = "Pending" as MessageStatus;
        const instance = await ChatLog.getChatLogInstance();
        instance.appendLog(group, messages);
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
                formData.append('message', JSON.stringify({ messages, groupID: group }))
                await axios.post(`${BASE_URL}/api/chat`, formData, { headers: { 'content-type': 'multipart/form-data' } })
            } else {
                formData = { message: JSON.stringify({ messages, groupID: group })}
                await axios.post(`${BASE_URL}/api/chat`, formData)
            }
            
            const instance = await ChatLog.getChatLogInstance();
            instance.updateMessageStatus(groupID, "Sent", messages[0]);
            //update the messages
            setMessages(filterOutEmptyMessages(instance.chatLog[groupID]));
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
            await axios.post(`${BASE_URL}/api/chat/join-group`, { id: groupID, name: group.name })
            resetMessages(true);
        } catch (err) {
            console.log('unable to join group');
            console.error(err);
        }
    }

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
                        backgroundColor="#ccccff"
                        leftComponent={
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <Ionicons 
                                    name="arrow-back-sharp" 
                                    size={avatarSize} 
                                    color="#734f96" 
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
                                <Text style={{ color: "#734f96", fontSize: 17 }}>{`${group.name}`}</Text>
                                {group.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                            </View>
                        }
                        rightComponent={
                            !newGroup && <Ionicons 
                                name="information-circle-outline" 
                                size={avatarSize} 
                                color="#734f96" 
                                onPress={() => drawerRef.current.openDrawer()}
                            />
                        }
                    />
                    {newGroup ? 
                        <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                            <Button title={`Join ${group.name}`} onPress={handleJoinGroup}/>
                        </View>
                        :
                        <GiftedChat
                            ref={giftedChatRef}
                            user={user}
                            messages={messages}
                            onSend={messages => onSend(messages)}
                            renderMessage={props => { return ( <CustomMessage children={props} onLongPress={id => handleLongPress(id)} /> ) }}
                            renderInputToolbar={props => { return ( <CustomToolbar children={props} onImagePick={type => onImagePick(type)} /> ) }}
                            isKeyboardInternallyHandled={true}
                            loadEarlier
                            onLoadEarlier={onLoadEarlier}
                        />
                    }
                </DrawerLayout>
            }
            
        </View>
    )
}

export default Chat


