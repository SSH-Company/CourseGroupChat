import React, { useEffect, useState, createContext } from 'react'
import { 
    AsyncStorage, 
    StyleSheet,
    Text,
    View 
} from 'react-native'
import SignUp from './SignUp'
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

export const UserContext = createContext(-1)

const LogIn = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [newUser, setNewUser] = useState(false)
    const [userID, setUserID] = useState(-1)

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

    const checkLogIn = async () => {
        const token = await AsyncStorage.getItem('token');
        // const token = 'TOKEN_ONE';
        if (token) {
            axios.post(`${BASE_URL}/api/login/`, { userToken: token })
                .then(async res => {
                    const user = res.data 
                    await AsyncStorage.setItem('token', token)
                    await AsyncStorage.setItem('user', JSON.stringify(user))
                    //redirect to Main
                    setLoading(false)
                    setUserID(user.user.ID)
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