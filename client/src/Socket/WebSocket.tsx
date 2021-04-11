import React, { useState, useEffect, useContext, useRef, createContext } from "react";
import { User } from 'react-native-gifted-chat';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../Auth/Login';
import { ChatLog } from '../Util/ChatLog';
import { navigationRef, navigate } from '../Util/RootNavigation';
import BASE_URL from '../BaseUrl';

export const RenderMessageContext = createContext({
    postStatus: false,
    renderFlag: false,
    setPostStatus: (flag: boolean) => {},
    setRenderFlag: (flag: boolean) => {}
});

const Socket = ({ children }) => {
    const user = useContext(UserContext);
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

    const schedulePushNotification = async (group: User, text: string) => {
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
            socket.send(JSON.stringify({userID: user._id}))
        }

        socket.onmessage = async (e: any) => {
            const data = JSON.parse(e.data)
            var log: any;

            console.log(data);

            switch (data.command) {
                case 'refresh':
                    log = await ChatLog.getChatLogInstance();
                    await log.refreshGroup(data.groupID);
                    break;
                case 'append':
                    log = await ChatLog.getChatLogInstance()
                    const newMessage:any = [{
                        _id: data._id,
                        text: data.text || '',
                        createdAt: data.createdAt || Date.now(),
                        user: {...data.senderID}
                    }]
                    //check if message contains image/video
                    let mediaType = ''
                    if (data.hasOwnProperty('image') && data.image !== '') mediaType = "image"
                    if (data.hasOwnProperty('video') && data.video !== '') mediaType = "video"
                    
                    if (mediaType !== '') {
                        newMessage[0][mediaType] = data[mediaType];
                        newMessage[0].subtitle = `${data.groupID.name} sent a ${mediaType}.`;
                    }

                    log.appendLog(data.groupID, newMessage)  
                    setPostStatus(true); 

                    //notify the user
                    const notificationBody = newMessage[0].subtitle || newMessage[0].text
                    console.log(notificationBody)

                    //check current view the user is in
                    const currentRoute = navigationRef.current.getCurrentRoute(); 

                    //only notify if this groups view is not open
                    if (currentRoute.name === 'Chat') {
                        if (data.groupID.id !== currentRoute.params.groupID.id)
                            await schedulePushNotification(data.groupID, notificationBody);
                    } else await schedulePushNotification(data.groupID, notificationBody);

                    break;
                default:
                    break;
            }
            setRenderFlag(prevFlag => !prevFlag)
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
