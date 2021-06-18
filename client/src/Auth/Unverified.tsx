import React, { useState } from 'react';
import { 
    Text, 
    StyleSheet, 
    ImageBackground,
    SafeAreaView
} from 'react-native';
import { BASE_URL } from "../BaseUrl";
import axios from 'axios';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    background: {
        flex: 1,
        width: '100%',
        resizeMode: 'cover',
        justifyContent: 'center'
    },
    text: {
        textAlign: 'center',
        fontSize: 18
    }
})

const Unverified = ({ userId, handleLogout }) => {

    const [message, setMessage] = useState('')

    const handleResend = () => {
        if (userId?.length > 0) {
            axios.post(`${BASE_URL}/api/auth/resend-verification`, { userId })
                .then(res => {
                    const email = res.data.email;
                    setMessage(`Verification email has been sent to ${email}!`);
                })
                .catch(err => {
                    console.error(err);
                })
        }
    }

    return (
        <SafeAreaView style={styles.container} key={message}>
            <ImageBackground source={require('../../assets/website.png')} style={styles.background}>
                {message.length > 0 && 
                <Text style={[styles.text, { fontWeight: 'bold' } ]}>{message}{"\n"}</Text>}
                <Text style={[styles.text, { fontWeight: 'bold' } ]}>Please verify your email to continue{"\n"}</Text>
                <Text style={[styles.text, { fontSize: 15 }]}>Can't find the verification email?</Text>
                <Text style={[styles.text, { fontSize: 15 }]}>Check your junk/spam folder.{"\n"}</Text>
                <Text style={[styles.text, { color: 'green', textDecorationLine: 'underline' }]} onPress={handleResend}>Click here to resend verification email{"\n"}</Text>
                <Text style={[styles.text, { color: 'blue', textDecorationLine: 'underline' }]} onPress={handleLogout}>Click here to log out of this account{"\n"}</Text>
            </ImageBackground>
        </SafeAreaView>
    )
}


export default Unverified
