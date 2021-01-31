import React, { useState, useEffect, useContext, createContext } from "react";
import { UserContext } from '../Auth/Login';
import BASE_URL from '../../BaseUrl';
import { ChatLog } from './ChatLog'

export const RecipientMessageMapContext = createContext({})
export const RenderMessageContext = createContext(false)

const Socket = ({ children }) => {
    const userID = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState();

    useEffect(() => {
        if(userID !== -1) websocketConnect()
    }, [userID])  

    //WebSocket connection
    const websocketConnect = () => {
        const url = BASE_URL.split('//')[1]
        const socket = new WebSocket(`ws://${url}`);
        const log = ChatLog.getChatLog();

        socket.onopen = () => {
            socket.send(JSON.stringify({userID: userID}));
        }

        socket.onmessage = (e: any) => {
            const data = JSON.parse(e.data)
            const newMessage:any = [{
                _id: data._id,
                text: data.text,
                createdAt: new Date(),
                user: {
                    _id: data.senderID,
                    name: 'Test name',
                    avatar: 'https://placeimg.com/140/140/any'
                }
            }]
            log.appendLog(data.senderID, newMessage)
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
