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

export const handleError = (error: any) => {
    const response = error.response;
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
                console.error(response.data)
                break;
        }
    }
}


