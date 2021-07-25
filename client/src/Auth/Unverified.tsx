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

    const [message, setMessage] = useState('Please verify your email to continue');
    const [loadingResend, setLoadingResend] = useState(false);

    const handleResend = () => {
        setLoadingResend(true);
        if (userId > 0) {
            axios.post(`${BASE_URL}/api/auth/resend-verification`, { userId })
                .then(res => {
                    const email = res.data.email;
                    setMessage(`Verification email has been sent to ${email}!`);
                })
                .catch(err => {
                    console.error(err);
                    setMessage('Looks like something is wrong on our end. Please check back later and try again.');
                })
                .finally(() => {
                    setLoadingResend(false);
                })
        }
    }

    return (
        <SafeAreaView style={styles.container} key={`${message}-${loadingResend}`}>
            <ImageBackground source={require('../../assets/website.png')} style={styles.background}>
                <Text style={[styles.text, { fontWeight: 'bold' } ]}>{message}{"\n"}</Text>
                <Text style={[styles.text, { fontSize: 15 }]}>Can't find the verification email?</Text>
                <Text style={[styles.text, { fontSize: 15 }]}>Check your junk/spam folder.{"\n"}</Text>
                {!loadingResend && <Text style={[styles.text, { fontSize: 16, color: 'green', textDecorationLine: 'underline' }]} onPress={handleResend}>Click here to resend verification email{"\n"}</Text>}
                <Text style={[styles.text, { fontSize: 16, color: 'blue', textDecorationLine: 'underline' }]} onPress={handleLogout}>Already verified? Click here to reload the app!{"\n"}</Text>
            </ImageBackground>
        </SafeAreaView>
    )
}


export default Unverified
