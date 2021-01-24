import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

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

const SignIn = () => {
    return (
        <View style={[styles.container, styles.horizontal]}>
            <Text>Sign In Page!</Text>
        </View>
    )
}

export default SignIn
