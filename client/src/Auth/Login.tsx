import React, { useEffect } from 'react'
import { 
    AsyncStorage, 
    StyleSheet,
    Text,
    View 
} from 'react-native'
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

    useEffect(() => {
        checkLogIn()
    }, [])

    const checkLogIn = async () => {
        const token = await AsyncStorage.getItem('token');
        // const token = 'TOKEN_TWO';
        if (token) {
            axios.post(`${BASE_URL}/api/login/`, { userToken: token })
                .then(async res => {
                    const user = res.data 
                    await AsyncStorage.setItem('token', token)
                    await AsyncStorage.setItem('user', JSON.stringify(user))
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

    return (
        <View style={[styles.container, styles.horizontal]}>
            <Text>Loggin in...</Text>
        </View>
    )
}

export default LogIn