import React, { useState, useEffect, useContext, createContext } from "react";
import { IMessage } from 'react-native-gifted-chat';
import { UserContext } from '../Auth/Login';
import { exampleList } from "../Main/exampleList";

type RecipientMessageMapType = {
    [key: number]: IMessage[]
}

export const RecipientMessageMapContext = createContext({})
export const RenderMessageContext = createContext(false)

const Socket = ({ children }) => {
    const userID = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState(false);
    const [recipientMessageMap, setRecipientMessageMap] = useState<RecipientMessageMapType>({});
    
    //Create recipient id -> IMessage[] map
    useEffect(() => {
        let map = {} as RecipientMessageMapType
        exampleList.map(row => {
            const newMessage = [{
                _id: row.message_id,
                text: row.subtitle,
                createdAt: row.created_at,
                user: {
                    _id: row.id,
                    name: row.name,
                    avatar: row.avatar_url
                }
            }]
            map[row.id] = newMessage
        })
        setRecipientMessageMap(map)
    }, [exampleList])

    useEffect(() => {
        websocketConnect()
    }, [])  

    //WebSocket connection
    const websocketConnect = () => {
        const socket = new WebSocket('ws://192.168.0.124:3000');

        socket.onopen = () => {
            socket.send(JSON.stringify({userID: userID}));
        }

        socket.onmessage = (e: any) => {
            const data = JSON.parse(e.data)
            const newMessage:any = {
                _id: data._id,
                text: data.text,
                createdAt: new Date(),
                user: {
                    _id: data.recipientID.id,
                    name: data.recipientID.name,
                    avatar: data.recipientID.avatar
                }
            }
            setRecipientMessageMap(oldMap => {
                const newMap = oldMap;
                newMap[data.recipientID.id].unshift(newMessage)
                return newMap
            })
            setRenderFlag(!renderFlag);
        }

        return () => { socket.close() }
    }

    return (
        <RecipientMessageMapContext.Provider value={recipientMessageMap}>
            <RenderMessageContext.Provider value={renderFlag}>
                {children}
            </RenderMessageContext.Provider>
        </RecipientMessageMapContext.Provider>
    )
}

export default Socket
