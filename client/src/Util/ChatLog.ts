import { IMessage } from 'react-native-gifted-chat';

type RecipientMessageMapType = {
    [key: number]: IMessage[]
}

type GroupInfoMapType = {
    [id: number]: {
        name: string,
        avatar: string
    }
}

export class ChatLog {
    private static instance: ChatLog;
    public chatLog = {} as RecipientMessageMapType;
    public groupInfo = {} as GroupInfoMapType;

    constructor(list: any) {
        let map = {} as RecipientMessageMapType
        let grpInfo = {} as GroupInfoMapType;
        list.map(row => {
            const newMessage = {
                _id: row.message_id,
                text: row.subtitle,
                createdAt: row.created_at,
                user: {
                    _id: row.creator_id,
                    name: row.name,
                    avatar: row.avatar_url
                },
                received: true
            }
            if (row.id in map) map[row.id].push(newMessage)
            else {
                map[row.id] = [newMessage]
                grpInfo[row.id] = {
                    name: row.name,
                    avatar: row.avatar_url
                }
            }
        })
        this.chatLog = map
        this.groupInfo = grpInfo
    }

    public static getChatLogInstance(list?: any) {
        if (!this.instance && list) {
            this.instance = new ChatLog(list)
        }
        return this.instance
    }

    public appendLog(groupID: number, message: IMessage[]) {
        if (groupID in this.chatLog) this.chatLog[groupID] = message.concat(this.chatLog[groupID])
        else { console.log('id not found in log') }
    }

    public printLog() {
        console.log(this.chatLog)
    }

    public printGroupInfo() {
        console.log(this.groupInfo)
    }
}
