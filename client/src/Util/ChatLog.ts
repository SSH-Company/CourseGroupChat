import { exampleList } from "../Main/exampleList";
import { IMessage } from 'react-native-gifted-chat';

type RecipientMessageMapType = {
    [key: number]: IMessage[]
}

export class ChatLog {
    private static instance: ChatLog;
    public chatLog = {} as RecipientMessageMapType;

    constructor(list: any) {
        let map = {} as RecipientMessageMapType
        list.map(row => {
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
        this.chatLog = map
    }

    public static getChatLog() {
        if (!this.instance) {
            this.instance = new ChatLog(exampleList)
        }
        return this.instance
    }

    public appendLog(senderID: number, message: IMessage[]) {
        if (senderID in this.chatLog) this.chatLog[senderID] = message.concat(this.chatLog[senderID])
        else { console.log('id not found in log') }
    }
}