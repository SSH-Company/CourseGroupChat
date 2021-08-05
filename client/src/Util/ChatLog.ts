import { IMessage } from 'react-native-gifted-chat';
import { handleError } from '../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

type RecipientMessageMapType = {
    [key: string]: IMessage[]
}

type GroupInfoMapType = {
    [id: string]: {
        name: string,
        avatar: string,
        verified: 'Y' | 'N',
        entered: boolean,
        mute: string | null,
        member_count: number
    }
}

//function taken from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript?page=2&tab=votes#tab-top
export function revisedRandId() {
    var len = 32;
    var str = '';
    var i = 0;
    
    for(i=0; i<len; i++) {
        switch(Math.floor(Math.random()*3+1)) {
            case 1: // digit
                str += (Math.floor(Math.random()*9)).toString();
            break;
    
            case 2: // small letter
                str += String.fromCharCode(Math.floor(Math.random()*26) + 97); //'a'.charCodeAt(0));
            break;
    
            case 3: // big letter
                str += String.fromCharCode(Math.floor(Math.random()*26) + 65); //'A'.charCodeAt(0));
            break;
    
            default:
            break;
        }
    }
    return str;
}

export type MessageStatus = "Pending" | "Sent"

export class ChatLog {
    private static instance: ChatLog;
    public userID = -1;
    public chatLog = {} as RecipientMessageMapType;
    public groupInfo = {} as GroupInfoMapType;

    constructor(list: any, groupInfo: any, userID: number) {
        let map = {} as RecipientMessageMapType
        let grpInfo = {} as GroupInfoMapType
        for (const row of list) {
            const newMessage = {
                _id: row.message_id || revisedRandId(),
                text: row.text || '',
                image: row.image || '',
                video: row.video || '',
                file: row.file || '',
                audio: row.audio || '',
                location: row.location || '',
                subtitle: row.subtitle || '',
                createdAt: row.createdAt,
                user: {
                    _id: row.creator_id,
                    name: row.creator_name,
                    avatar: row.creator_avatar ? row.creator_avatar : EMPTY_IMAGE_DIRECTORY
                },
                status: row.status,
                displayStatus: false
            }
            if (row.id in map) { map[row.id].push(newMessage) }
            else {
                const info = groupInfo.filter(r => r.id === row.id)[0];
                if (info) {
                    map[row.id] = [newMessage]
                    grpInfo[row.id] = {
                        name: info?.name || row.name,
                        avatar: info?.avatar || EMPTY_IMAGE_DIRECTORY,
                        verified: info?.verified || row.verified,
                        entered: false,
                        mute: info?.mute || null,
                        member_count: info?.member_count
                    }
                }
            }
        }

        this.chatLog = map
        this.groupInfo = grpInfo
        this.userID = userID
    }

    public static async getChatLogInstance(refreshLog: boolean = false, userID?: any) {
        if ((!this.instance && userID) || refreshLog) {
            //retrieve log
            try {
                const id = userID ? userID : this.instance.userID;
                const res = await axios.get(`${BASE_URL}/api/chat/test-log`)
                this.instance = new ChatLog(res.data.parsedLog, res.data.groupInfo, id);
                return this.instance;    
            } catch (err) {
                handleError(err)
            }
        } else {
            return this.instance
        }
    }
}


