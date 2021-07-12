import React, { useState, useEffect, useContext, useRef, createContext } from "react";
import { User } from 'react-native-gifted-chat';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../Auth/Login';
import { ChatLog } from './ChatLog';
import { navigationRef, navigate } from './RootNavigation';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

export const RenderMessageContext = createContext({
    postStatus: false,
    renderFlag: false,
    setPostStatus: (flag: boolean) => {},
    setRenderFlag: (flag: boolean) => {}
});

const Socket = ({ children }) => {
    const { user } = useContext(UserContext);
    const [postStatus, setPostStatus] = useState(true);
    const [renderFlag, setRenderFlag] = useState(false)
    const value = { postStatus, renderFlag, setPostStatus, setRenderFlag } as any
    const notificationListener = useRef<any>(null);

    useEffect(() => {
        if(user._id) websocketConnect()
    }, [user])  

    useEffect(() => {
        //detect when user touch notification
        notificationListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            navigate('Chat', { groupID: data.id });
        });
      
        return () => { notificationListener.current.remove() }
    }, [])

    const triggerNotification = async (group: User, text: string) => {
        await Notifications.scheduleNotificationAsync({
            content: {
              title: group.name as string,
              body: text,
              data: {...group}
            },
            trigger: null,
        });
    }

    //WebSocket connection
    const websocketConnect = () => {
        const url = BASE_URL.split('//')[1]
        const socket = new WebSocket(`ws://${url}`)

        socket.onopen = () => {
            console.log('socket connected');
            socket.send(JSON.stringify({userID: user._id}))
        }

        socket.onmessage = async (e: any) => {
            const data = JSON.parse(e.data)
            var log: any;
            
            if (!(data.hasOwnProperty('groupId') && data.groupId.length > 0)) return;

            //check current view the user is in
            const currentRoute = navigationRef.current?.getCurrentRoute(); 

            log = await ChatLog.getChatLogInstance()

            let groupInfo = {} as any;
            //retrieve group information
            if (!(data.groupId in log.groupInfo)) {
                log = await ChatLog.getChatLogInstance(true);   
            }
            groupInfo = {...log.groupInfo[data.groupId], id: data.groupId};
            
            switch (data.command) {
                case 'refresh':
                    await log.refreshGroup(groupInfo.id);
                    break;
                case 'append':
                    const newMessage:any = [{
                        _id: data._id,
                        text: data.text || '',
                        createdAt: data.createdAt || Date.now(),
                        user: {...data.senderID, avatar: data.senderID.avatar || EMPTY_IMAGE_DIRECTORY }
                    }]
                    
                    //check if message contains image/video
                    let mediaType = ''
                    if (data.hasOwnProperty('image') && data.image !== '') mediaType = "image"
                    if (data.hasOwnProperty('video') && data.video !== '') mediaType = "video"
                    
                    if (mediaType !== '') {
                        newMessage[0][mediaType] = data[mediaType];
                        newMessage[0].subtitle = `${groupInfo.name} sent a ${mediaType}.`;
                    }

                    //notify the user
                    const notificationBody = newMessage[0].subtitle || newMessage[0].text
                    console.log(notificationBody)
                    
                    //only notify if this groups view is not open, and the group notification is not muted
                    if (groupInfo?.mute === null || (groupInfo?.mute !== 'indefinite' && new Date() > new Date(groupInfo?.mute))) {
                        await log.appendLog(groupInfo.id, newMessage);
                        setPostStatus(true); 
                        if (currentRoute.name === 'Chat') {
                            if (groupInfo.id !== currentRoute.params.groupID) {
                                await triggerNotification(groupInfo, notificationBody);
                            }
                        } else await triggerNotification(groupInfo, notificationBody);
                    }
                    
                    break;
                default:
                    break;
            }
            if (currentRoute.name === 'Chat' && groupInfo.id === currentRoute.params.groupID) {
                console.log('re rendering...')
                setRenderFlag(prevFlag => !prevFlag)
            } else {  
                console.log('re rendering...')
                setRenderFlag(prevFlag => !prevFlag)
            }
        }

        socket.onclose = (e: any) => {
            console.log('socket closed')
        }

        return () => { socket.close(); }
    }

    return (
        <RenderMessageContext.Provider value={value}>
            {children}
        </RenderMessageContext.Provider>
    )
}

export default Socket


