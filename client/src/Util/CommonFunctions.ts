import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

// Parameters: group ID - string, leave: boolean
// returns null
export const handleLeaveGroup = (users: string[], groupID: string, leave: boolean, onSuccess: () => any) => {
    axios.delete(`${BASE_URL}/api/chat/remove-from-group`, { data: {
        users: users,
        grpId: groupID,
        leave: leave
    } })
    .then(() => onSuccess)
    .catch(err => console.log(err));
}