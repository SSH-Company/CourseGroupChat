import { IMessage } from 'react-native-gifted-chat';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

type RecipientMessageMapType = {
    [key: string]: IMessage[]
}

type GroupInfoMapType = {
    [id: string]: {
        name: string,
        avatar: string,
        verified: 'Y' | 'N',
        entered: boolean
    }
}

export function revisedRandId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

export type MessageStatus = "Pending" | "Sent"

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
                _id: row.message_id || revisedRandId(),
                text: row.text || '',
                image: row.image || '',
                video: row.video || '',
                subtitle: row.subtitle || '',
                createdAt: row.created_at,
                user: {
                    _id: row.creator_id,
                    name: row.creator_name,
                    avatar: row.avatar_url
                },
                status: row.status,
                displayStatus: false
            }
            if (row.id in map) map[row.id].push(newMessage)
            else {
                map[row.id] = [newMessage]
                grpInfo[row.id] = {
                    name: row.name,
                    avatar: row.avatar_url,
                    verified: row.verified,
                    entered: false
                }
            }
        })
        
        this.chatLog = map
        this.groupInfo = grpInfo
        this.userID = userID
    }

    public static async getChatLogInstance(refreshLog: boolean = false, userID?: any) {
        if ((!this.instance && userID) || refreshLog) {
            const id = userID ? userID : this.instance.userID;
            //retrieve log
            try {
                const res = await axios.get(`${BASE_URL}/api/chat/log/${id}`)
                this.instance = new ChatLog(res.data, id);
                return this.instance;    
            } catch (err) {
                console.error('Something went wrong attempting to fetch chat log.');
            }
        } else {
            return this.instance
        }
    }

    public appendLog(group: { id: string, name?: string, avatar?: string, verified: 'Y' | 'N' }, message: IMessage[]) {
        if (group.id in this.chatLog) this.chatLog[group.id] = message.concat(this.chatLog[group.id])
        else { 
            //new group has been created/joined
            this.chatLog[group.id] = message
            this.groupInfo[group.id] = {
                name: group.name,
                avatar: group.avatar,
                verified: group.verified,
                entered: false
            }
        }
    }

    public updateMessageStatus(groupID: string, status: MessageStatus, message: IMessage) {
        const messages = this.chatLog[groupID]
        if (messages) {
            for (const msg of messages) {
                if (msg._id === message._id) {
                    msg['status'] = status;
                    msg['displayStatus'] = true;
                }
            }
            this.chatLog[groupID] = messages;
        }
    }

    public async refreshGroup(groupID: string, loadEarlier: boolean = false, name?: string, avatar?: string) {
        //new group has been created/joined
        if (!(groupID in this.chatLog)) {
            const newMessage = {
                _id: revisedRandId(),
                text: '',
                subtitle: `You have been added to ${name}`,
                createdAt: Date.now(),
                user: {
                    _id: this.userID,
                    name: 'rand',
                    avatar: ''
                }
            }
            this.chatLog[groupID] = [newMessage]
            this.groupInfo[groupID] = {
                name: name,
                avatar: avatar,
                verified: 'N',
                entered: true
            }
            return;
        };

        try {
            const currMessages = this.chatLog[groupID];
            const rowCount = loadEarlier ? currMessages.length + 20 : currMessages.length;
            const response = await axios.get(`${BASE_URL}/api/chat/load-earlier-messages`, { params: { groupID, rowCount } });
            this.chatLog[groupID] = response.data;
        } catch (err) {
            console.error('Something went wrong attempting to refresh group messages.');
        }
    }

    public updateGroupEntered(groupID: string, value: boolean) {
        this.groupInfo[groupID] = {...this.groupInfo[groupID], entered: value};
        return;
    }
}
