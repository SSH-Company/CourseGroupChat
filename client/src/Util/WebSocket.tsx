import React, { useState, useEffect, useContext, useRef, createContext } from "react";
import { User } from 'react-native-gifted-chat';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../Auth/Login';
import { navigationRef, navigate } from './RootNavigation';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

export const RenderMessageContext = createContext({
    renderFlag: false,
    setRenderFlag: (flag: boolean) => {},
    socketData: {} as any
});

const Socket = ({ children }) => {
    const { user } = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState(false);
    const [socketData, setSocketData] = useState({} as any);
    const value = { renderFlag, setRenderFlag, socketData } as any
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
            let data = JSON.parse(e.data)
            
            if (!(data.hasOwnProperty('groupInfo') && Object.keys(data.groupInfo).length > 0)) return;

            //check current view the user is in
            const currentRoute = navigationRef.current?.getCurrentRoute(); 

            let groupInfo = data.groupInfo;

            switch (data.command) {
                case 'refresh':
                    break;
                case 'append':
                    //check if message contains image/video
                    let mediaType = '', subtitle = '';
                    if (data.hasOwnProperty('image') && data.image !== '') mediaType = "image"
                    if (data.hasOwnProperty('video') && data.video !== '') mediaType = "video"
                    
                    if (mediaType !== '') {
                        subtitle = `${groupInfo.name} sent a ${mediaType}.`;
                        data.subtitle = subtitle;
                    }

                    //notify the user
                    const notificationBody = subtitle || data.text
                    
                    //only notify if this groups view is not open, and the group notification is not muted
                    if (groupInfo?.mute === null || (groupInfo?.mute !== 'indefinite' && new Date() > new Date(groupInfo?.mute))) {
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

            setSocketData({...data});
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


