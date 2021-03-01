import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    }
});

const SignUp = () => {
    return (
        <WebView
            source={{ uri: 'https://ssh-company-dev.onelogin.com/login' }}
            style={{ marginTop: 20 }}
        />
    )
}

export default SignUp
