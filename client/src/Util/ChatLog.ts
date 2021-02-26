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

export type MessageStatus = "Pending" | "Sent" | "Read"

export class ChatLog {
    private static instance: ChatLog;
    public userID = -1;
    public chatLog = {} as RecipientMessageMapType;
    public groupInfo = {} as GroupInfoMapType;

    constructor(list: any, userID: number) {
        let map = {} as RecipientMessageMapType
        let grpInfo = {} as GroupInfoMapType
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
                status: row.status
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
        this.userID = userID
    }

    public static getChatLogInstance(list?: any, userID?: number) {
        if (!this.instance && list && userID) {
            this.instance = new ChatLog(list, userID)
        }
        return this.instance
    }

    public appendLog(group: { id: number, name?: string, avatar?: string }, message: IMessage[]) {
        if (group.id in this.chatLog) this.chatLog[group.id] = message.concat(this.chatLog[group.id])
        else { 
            //new group has been created
            this.chatLog[group.id] = message
            this.groupInfo[group.id] = {
                name: group.name,
                avatar: group.avatar
            }
        }
    }

    //TODO: write a better function here to handle all use cases
    public updateMessageStatus(groupID: number, status: MessageStatus, message?: IMessage) {
        const messages = this.chatLog[groupID]
        if (messages) {
            if (message) {
                for (const msg of messages) {
                    msg['displayStatus'] = false;
                    if (msg._id === message._id) {
                        msg['status'] = status
                        //only display status for last sent message
                        msg['displayStatus'] = true;    
                    }
                }
            } else {
                messages[0]['displayStatus'] = true;
                for (const msg of messages) {
                    if (msg['status'] === status) break;
                    msg['status'] = status
                }
            }
            this.chatLog[groupID] = messages
        }
    }
}
