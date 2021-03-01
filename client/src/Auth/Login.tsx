import React, { useRef, useEffect, useState, createContext } from 'react'
import { 
    AppState,
    AsyncStorage, 
    StyleSheet,
    Text,
    View 
} from 'react-native'
import { User } from 'react-native-gifted-chat'
import SignUp from './SignUp'
import { ChatLog } from '../Util/ChatLog'
import BASE_URL from '../../BaseUrl'
import axios from 'axios'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around"
    }
});

export const UserContext = createContext({} as User)

const LogIn = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [newUser, setNewUser] = useState(false)
    const [userID, setUserID] = useState({} as User)
    const appState = useRef(AppState.currentState)

    /*
        How it works:
        The access token is first extracted from Async Storage.

        If the access token exists:
        We send a request to our Login controller to get the user data using the token. The controller
        function will verify the token and set the session data in the server. The user data and 
        token will be stored in the phones local storage.

        If it doesn't exist: 
        The user isn't logged in, redirect to Auth Screen
    */

    useEffect(() => {
        checkLogIn()
    }, [])

    useEffect(() => {
        AppState.addEventListener("change", handleAppStateChange);

        return () => {
            AppState.removeEventListener("change", handleAppStateChange);
        }
    }, [])

    const checkLogIn = async () => {
        // const token = '1';
        const token = null;
        if (token) {
            axios.post(`${BASE_URL}/api/login/`, { userToken: token })
                .then(async res => {
                    const user = res.data 
                    await AsyncStorage.setItem('token', token)
                    await AsyncStorage.setItem('user', JSON.stringify(user))
                    await ChatLog.getChatLogInstance(true, user.user.ID); 
                    setUserID({
                        _id: user.user.ID,
                        name: user.user.FIRST_NAME + ' ' + user.user.LAST_NAME,
                        avatar: 'https://placeimg.com/140/140/any'
                    })
                    //redirect to Main
                    setLoading(false)
                })
                .catch(e => {
                    console.log('login error:', e.response.data)
                })
        } else {
            //not logged in
            setLoading(false)
            setNewUser(true)
        }
    }  

    const handleAppStateChange = (nextAppState) => {
        appState.current = nextAppState
    }

    if (loading) {
        return (
            <View style={[styles.container, styles.horizontal]}>
                <Text>Logging in...</Text>
            </View>
        )
    } else {
        if (newUser) {
            return (
                <SignUp />
            )
        } else {
            return (
                <UserContext.Provider value={userID}>
                    {children}
                </UserContext.Provider>
            )
        }
    }
}

export default LogIn