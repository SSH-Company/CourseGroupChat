import React, { useState, useEffect, useContext, createContext } from "react";
import { IMessage } from 'react-native-gifted-chat';
import { UserContext } from '../Auth/Login';
import { exampleList } from "../Main/exampleList";
import BASE_URL from '../../BaseUrl';

type RecipientMessageMapType = {
    [key: number]: IMessage[]
}

export const RecipientMessageMapContext = createContext({})
export const RenderMessageContext = createContext(false)

const Socket = ({ children }) => {
    const userID = useContext(UserContext);
    const [renderFlag, setRenderFlag] = useState();
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
        if(userID !== -1) websocketConnect()
    }, [userID])  

    //WebSocket connection
    const websocketConnect = () => {
        const url = BASE_URL.split('//')[1]
        const socket = new WebSocket(`ws://${url}`);

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
                    _id: data.senderID,
                    name: 'Test name',
                    avatar: 'https://placeimg.com/140/140/any'
                }
            }
            setRecipientMessageMap(oldMap => {
                const newMap = oldMap;
                newMap[data.senderID].unshift(newMessage)
                return newMap
            })
            setRenderFlag(prevFlag => !prevFlag);
        }
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
