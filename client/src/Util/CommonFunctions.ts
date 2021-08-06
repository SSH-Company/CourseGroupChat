import { Alert } from 'react-native';
import { Restart } from 'fiction-expo-restart';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';

// Parameters: group ID - string, leave: boolean
// returns null
export const handleLeaveGroup = (users: string[], groupID: string, leave: boolean, onSuccess: () => any) => {
    axios.delete(`${BASE_URL}/api/chat/remove-from-group`, { data: {
        users: users,
        grpId: groupID,
        leave: leave
    } })
    .then(() => onSuccess())
    .catch(err => handleError(err));
}

//Helper function for converting milliseconds to mm:ss
export const millisToMinutesAndSeconds = (millis) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = Number(((millis % 60000) / 1000).toFixed(0));
    return (
        seconds == 60 ?
        (minutes+1) + ":00" :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    );
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

export const handleError = (error: any) => {
    const response = error.response;
    console.log(error)
    if (response) {
        switch(response.status) {
            case 400:
                Alert.alert(
                    'There was an error!',
                    response.data.message
                )
                break;
            case 401:
                Restart();
                break;
            case 409:
                Alert.alert(
                    'There was an error!',
                    response.data.message
                )
                break;
            default: 
                console.error(response.data);
                break;
        }
    }
}

export const handleIgnoreGroup = (groupID: string, onSuccess: () => any) => {
    axios.post(`${BASE_URL}/api/chat/ignore`, { groupID, status: "Y" })
        .then(() => onSuccess())
        .catch(err => {
            console.log(err)
            handleError(err)
        })
}

export const handleJoinCourseGroup = (id: string, onSuccess: () => any) => { 
    let mounted = true;
    axios.post(`${BASE_URL}/api/chat/join-group`, { id: id, name: id, verified: 'Y' })
        .then(res => {
            const status = res.data.status;
            if (status === 'success') {
                if (mounted) {
                    onSuccess();
                }
            } else {
                Alert.alert(
                    `Failed to join ${id}`,
                    'You are already enrolled in the maximum(8) number of courses. Please leave a group to join a new one.',
                    [{ text: "OK", style: "cancel" }]
                )
                return;
            }
        })
        .catch(err => {
            console.log('unable to join group');
            handleError(err);
        })
    
    return () => { mounted = false; }
}



