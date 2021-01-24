import React, { useState, useEffect } from 'react'
import { 
    ActivityIndicator, 
    AsyncStorage, 
    StyleSheet,
    Text,
    View 
} from 'react-native'
import axios from 'axios'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center"
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    }
});

const LogIn = ({ navigation }) => {
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

    const [loginSuccess, setLoginSuccess] = useState(false);

    useEffect(() => {
        checkLogIn()
    }, [])

    const checkLogIn = async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.post('/api/login/', { userToken: token })
                .then(async res => {
                    const user = res.data 
                    await AsyncStorage.setItem('token', token)
                    await AsyncStorage.setItem('user', JSON.stringify(user))
                    setLoginSuccess(true)
                    //redirect to Main
                    navigation.navigate('Main')
                })
                .catch(e => {
                    console.log('login error:', e.response.data)
                })
        } else {
            //not logged in
            navigation.navigate('SignIn')
        }
    }  

    if (!loginSuccess) {
        return (
            <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="small"/>
                <Text>Loggin in...</Text>
            </View>
        )
    }    
}

export default LogIn