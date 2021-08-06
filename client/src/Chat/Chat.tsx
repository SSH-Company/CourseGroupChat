import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { ActivityIndicator, Text, View, Dimensions, Clipboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Header } from "react-native-elements";
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { DrawerLayout } from 'react-native-gesture-handler';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { CustomMessage, CustomToolbar, MuteNotification } from './components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Util/WebSocket';
import GroupAvatar from '../Util/CommonComponents/GroupAvatar';
import VerifiedIcon from '../Util/CommonComponents/VerifiedIcon';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleError } from '../Util/CommonFunctions';
import InboxSettings from '../Util/CommonComponents/InboxSettings';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

const Chat = ({ route, navigation }) => {
    const { user } = useContext(UserContext)
    const { socketData } = useContext(RenderMessageContext);
    const [group, setGroup] = useState<any>({
        id: route.params.groupID || null,
        name: route.params.name || '',
        avatar: route.params.avatar || EMPTY_IMAGE_DIRECTORY,
        verified: route.params.verified || 'N',
        members: route.params.members || [],
        mute: route.params.mute || ''
    });
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const { showActionSheetWithOptions } = useActionSheet();
    const drawerRef = useRef(null);
    const giftedChatRef = useRef(null);
    const avatarSize = 25;
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [muteNotificationsModal, setMuteNotificationsModal] = useState(false);
    const [loadEarlier, setLoadEarlier] = useState(false);

    useEffect(() => {
        resetMessages();
    }, [route.params.groupID])

    useEffect(() => {
        //check socketdata and handle the event
        if (socketData.hasOwnProperty('command')) {
            switch(socketData.command) {
                case 'append':
                    //we are currently viewing the same group, append the message
                    if (group.id === socketData.groupInfo.id) {
                        setMessages(previousMessages => {
                            const filteredMessages = filterOutEmptyMessages([socketData]);
                            return GiftedChat.append(previousMessages, filteredMessages)
                        });
                    }
                    break;
                case 'delete':
                    //we are currently viewing the same group, remove the message
                    if (group.id === socketData.groupID) deleteMessage(socketData.messageID); 
                    break;
                default:
                    break;
            }
        }
    }, [socketData])

    const filterOutEmptyMessages = (msgs) => {
        return msgs.filter(msg => msg._id && (msg.text?.length > 0 || msg.image?.length > 0 || msg.video?.length > 0 || msg.file?.length > 0 || msg.audio?.length > 0 ));
    }

    const resetMessages = () => {
        if (group.id) {
            setLoading(true);
            axios.get(`${BASE_URL}/api/chat/log/${group.id}`)
                .then(res => {
                    const { messages, groupDetails, loadEarlier } = res.data;
                    setMessages(previousMessages => {
                        const messageIds = previousMessages.map(m => m._id);
                        const filteredMessages = filterOutEmptyMessages(messages).filter(m => !messageIds.includes(m._id));
                        return GiftedChat.append(previousMessages, filteredMessages)
                    });
                    setGroup({...groupDetails});    
                    setLoadEarlier(loadEarlier);
                })
                .catch(err => handleError(err))
                .finally(() => setLoading(false))
        }
    }
    
    const onSend = useCallback(async (messages = []) => {
        try {
            if (group.id === null) {
                //the message is being sent to a new group, so we need to create the
                //group first, and then send the message
                const res = await axios.post(`${BASE_URL}/api/search/create-group`, { recipients: group.members });
                const data = res.data;
                await sendData(messages, data.id);
                navigation.push('Chat', { groupID: data.id })
            } else {
                await sendData(messages);
                setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
            }

        } catch(err) {
            handleError(err);
        }
    }, [])

    //helper function for sending message to queue
    const sendData = async (messages = [], groupID = group.id) => {
        //here we are assuming only one message is posted at a time
        try {
            const fileType = messages[0].hasOwnProperty('fileData') || messages[0].hasOwnProperty('imageData');
            let formData: any;
            if (fileType) {
                formData = new FormData();
                formData.append('media', {...messages[0].fileData});
                formData.append('message', JSON.stringify({ messages, groupId: groupID }))
                await axios.post(`${BASE_URL}/api/chat`, formData, {headers: { accept: "application/json", 'Content-Type': 'multipart/form-data' }})
            } else {
                formData = { message: JSON.stringify({ messages, groupId: groupID })}
                await axios.post(`${BASE_URL}/api/chat`, formData)
            }
        } catch (err) {
            //TODO: display failed notification here
            handleError(err);
        }
    }

    const handleLongPress = (id: string, isCurrentUser: boolean, copyString: string | null) => {
        const options = [];
        if (copyString) options.push('Copy Text');
        if (isCurrentUser) options.push('Delete Message');
        const cancelButtonIndex = 3;
        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, async (buttonIndex) => {
            switch (buttonIndex) {
                // case 0:
                //     console.log('forward here');
                //     break;
                case 0:
                    if (copyString) Clipboard.setString(copyString) 
                    else if (isCurrentUser) handleDeleteMessage(id)
                    break;
                case 1:
                    handleDeleteMessage(id);
                    break;
            }
        });
    }

    const handleDeleteMessage = async (id: string) => {
        try {
            const reqBody = {
                groupID: group.id,
                messageID: id
            }
            await axios.delete(`${BASE_URL}/api/chat`, { data: reqBody });
            deleteMessage(id);
            return;
        } catch (err) {
            handleError(err)
        }
    }

    const onLoadEarlier = async () => {
        //calculate how many rows we need to retrieve
        const extraRowCount = messages.length + 21;

        axios.get(`${BASE_URL}/api/chat/load-earlier-messages`, { params: { groupID: group.id, rowCount: extraRowCount } })
            .then(res => {
                const { earlierMessages, loadEarlier } = res.data;
                setMessages(previousMessages => {
                    const messageIds = previousMessages.map(m => m._id);
                    const filteredMessages = filterOutEmptyMessages(earlierMessages.slice(-21)).filter(m => !messageIds.includes(m._id));
                    return GiftedChat.prepend(previousMessages, filteredMessages)
                });
                setLoadEarlier(loadEarlier);
            })
            .catch(err => handleError(err))
    }

    const deleteMessage = (id: string) => {
        setMessages(prevMessages => { 
            const filter = prevMessages.filter(m => m._id !== id);
            return GiftedChat.append([], filterOutEmptyMessages(filter)) 
        }); 
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
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
                            verified: group.verified,
                            newToGroup: false,
                            onMuteNotifications: visible => setMuteNotificationsModal(visible),
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
                                {group.verified === "Y" ?
                                    <GroupAvatar
                                        name={group.name}
                                        verified={"Y"}
                                        size={avatarSize}
                                        style={{ marginLeft: 10 }}
                                        onPress={() => drawerRef.current.openDrawer()}
                                    />
                                    :
                                    <Avatar 
                                        source={{ uri: group.avatar || EMPTY_IMAGE_DIRECTORY }} 
                                        rounded 
                                        size={avatarSize} 
                                        containerStyle={{ marginLeft: 10, borderColor: "white", borderWidth: 1 }}
                                        onPress={() => drawerRef.current.openDrawer()}
                                    /> 
                                }       
                            </View>
                        }
                        centerComponent={
                            <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ color: THEME_COLORS.ICON_COLOR, fontSize: 17 }}>{`${group.name}`}</Text>
                                {group.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                            </View>
                        }
                        rightComponent={
                            group.id && <Ionicons 
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
                    <MuteNotification
                        isMuted={group?.mute === 'indefinite' || (group?.mute !== null && new Date() < new Date(group?.mute))}
                        groupID={group.id}
                        visible={muteNotificationsModal}
                        onClose={(muteDate) => {
                            setMuteNotificationsModal(false);
                            setGroup(prev => { return {...prev, mute: muteDate} })
                        }}
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
                            loadEarlier={loadEarlier}
                            onLoadEarlier={onLoadEarlier}
                            isKeyboardInternallyHandled={false}
                            keyboardShouldPersistTaps='never'
                        />
                    </KeyboardAvoidingView>
                </DrawerLayout>
            }
            
        </View>
    )
}

export default Chat


