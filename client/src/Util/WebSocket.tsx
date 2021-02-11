import React, { useState, useEffect, useContext, createContext } from "react";
import { UserContext } from '../Auth/Login';
import BASE_URL from '../../BaseUrl';
import { ChatLog } from './ChatLog'

export const RenderMessageContext = createContext({
    renderFlag: false,
    setRenderFlag: (flag: boolean) => {}
});

const Socket = ({ children }) => {
    const user = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState(false)
    const value = { renderFlag, setRenderFlag} as any

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

        socket.onmessage = (e: any) => {
            const data = JSON.parse(e.data)
            const log = ChatLog.getChatLogInstance()
            const groupInfo = log.groupInfo[Number(data.groupID.id)]
            const newMessage:any = [{
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt || new Date(),
                user: {
                    _id: data.groupID.id,
                    name: groupInfo.name,
                    avatar: groupInfo.avatar
                }
            }]
            log.appendLog(data.groupID.id, newMessage)
            setRenderFlag(prevFlag => !prevFlag)
        }

        socket.onclose = (e: any) => {
            console.log('socket closed')
        }
    }

    return (
        <RenderMessageContext.Provider value={value}>
            {children}
        </RenderMessageContext.Provider>
    )
}

export default Socket
