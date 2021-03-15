import React, { useState, useEffect, useContext, createContext } from "react";
import { UserContext } from '../Auth/Login';
import { ChatLog } from '../Util/ChatLog';
import BASE_URL from '../../BaseUrl';

export const RenderMessageContext = createContext({
    postStatus: false,
    renderFlag: false,
    setPostStatus: (flag: boolean) => {},
    setRenderFlag: (flag: boolean) => {}
});

const Socket = ({ children }) => {
    const user = useContext(UserContext);
    const [postStatus, setPostStatus] = useState(false);
    const [renderFlag, setRenderFlag] = useState(false)
    const value = { postStatus, renderFlag, setPostStatus, setRenderFlag } as any

    useEffect(() => {
        if(user._id) websocketConnect()
    }, [user])  

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

            switch (data.command) {
                case 'refresh':
                    await ChatLog.getChatLogInstance(true);
                    setPostStatus(false);
                    break;
                case 'update':
                    log = await ChatLog.getChatLogInstance()
                    log.updateMessageStatus(data.groupID, data.status)
                    setPostStatus(false);
                    break;
                case 'append':
                    log = await ChatLog.getChatLogInstance()
                    const groupInfo = log.groupInfo[Number(data.groupID.id)]
                    const newMessage:any = [{
                        _id: data._id,
                        text: data.text || '',
                        image: data.image || '',
                        subtitle: data.image.length > 0 ? `${data.groupID.name} sent a photo` : data.text,
                        createdAt: data.createdAt,
                        user: {
                            _id: data.groupID.id,
                            name: groupInfo.name,
                            avatar: groupInfo.avatar
                        }
                    }]
                    log.appendLog(data.groupID, newMessage)  
                    setPostStatus(true); 
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
