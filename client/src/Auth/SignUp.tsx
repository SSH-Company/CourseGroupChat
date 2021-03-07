import React, { useContext } from 'react'
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

type SignUpProps = {
    viewType: "webview" | "children"
    source?: string,
    sourceType?: "uri" | "html",
    children?: any
}

const SignUp = ({ viewType, source, sourceType, children } : SignUpProps) => {

    const handleNavigationStateChange = (state) => {
        // console.log(state);
    }

    const handleMessage = (msg: string) => {
        try {
            const userData = JSON.parse(msg);
            console.log(userData);
        } catch (err) {
            console.log(err);
            return
        }
    }

    const injectedJavascript = `window.ReactNativeWebView.postMessage(document.getElementsByTagName('pre')[0].innerHTML);`;

    if (viewType === "webview") {
        return (
            <WebView
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={["*"]}
                source={sourceType === "uri" ? { uri: source } : { html: source }}
                style={{ marginTop: 20 }}
                onNavigationStateChange={handleNavigationStateChange}
                injectedJavaScript={injectedJavascript}
                onMessage={(e) => handleMessage(e.nativeEvent.data)}
            />
        )
    } else {
        return children
    }
}

export default SignUp
