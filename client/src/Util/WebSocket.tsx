import React, { useState, useEffect, useContext, createContext } from "react";
import { UserContext } from '../Auth/Login';
import BASE_URL from '../../BaseUrl';
import { ChatLog } from './ChatLog'

export const RenderMessageContext = createContext(false)

const Socket = ({ children }) => {
    const user = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState();

    useEffect(() => {
        if(user._id) websocketConnect()
    }, [user])  

    //WebSocket connection
    const websocketConnect = () => {
        const url = BASE_URL.split('//')[1]
        const socket = new WebSocket(`ws://${url}`);
        const log = ChatLog.getChatLog();

        socket.onopen = () => {
            socket.send(JSON.stringify({userID: user._id}));
        }

        socket.onmessage = (e: any) => {
            const data = JSON.parse(e.data)
            const newMessage:any = [{
                _id: data._id,
                text: data.text,
                createdAt: new Date(),
                user: {
                    _id: data.senderID._id,
                    name: data.senderID.name,
                    avatar: data.senderID.avatar
                }
            }]
            log.appendLog(data.senderID._id, newMessage)
            setRenderFlag(prevFlag => !prevFlag);
        }
    }

    return (
        <RenderMessageContext.Provider value={renderFlag}>
            {children}
        </RenderMessageContext.Provider>
    )
}

export default Socket
