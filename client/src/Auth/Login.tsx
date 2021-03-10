import React, { useRef, useEffect, useState, createContext } from 'react';
import { 
    AppState,
    StyleSheet,
    Text,
    View 
} from 'react-native';
import { User } from 'react-native-gifted-chat';
import { WebView } from 'react-native-webview';
import { ChatLog } from '../Util/ChatLog';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

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
    const [userID, setUserID] = useState({} as User);
    const [sourceHTML, setSourceHTML] = useState<any>();
    const appState = useRef(AppState.currentState);

    /*
        How it works:
        A request is sent to the backend where there is a Middleware check
        to ensure the user is logged in. If they aren't, a 302 status code
        is returned, where the redirect url can be used to open a WebView for 
        the user to login. After user verification is successful, the WebView 
        redirects to a page from where the User's database information is collected
        and stored. The user is then redirected to the Main page.
    */

    useEffect(() => {
        axios.get(`${BASE_URL}/api/login`)
            .then(async res => {
                setSourceHTML({ html: res.data });
                setNewUser(true);
                setLoading(false);
            })
            .catch(err => {
                const response = err.response;
                if (response) {
                    switch (response.status) {
                        case 302:
                            setNewUser(true);
                            setSourceHTML({ uri: response.data.redirect });
                            setLoading(false);
                            break;
                        default:
                            break;
                    }
                }
            })
    }, [])

    useEffect(() => {
        AppState.addEventListener("change", handleAppStateChange);

        return () => {
            AppState.removeEventListener("change", handleAppStateChange);
        }
    }, [])

    const handleAppStateChange = (nextAppState) => {
        appState.current = nextAppState
    }

    const handleNavigationStateChange = (state) => {
        // console.log(state);
    }

    const handleMessage = async (msg: string) => {
        try {
            const user = JSON.parse(msg);
            await ChatLog.getChatLogInstance(true, user.ID); 
            setUserID({
                _id: user.ID,
                name: user.FIRST_NAME + ' ' + user.LAST_NAME,
                avatar: 'https://placeimg.com/140/140/any'
            })
            //redirect to Main
            setNewUser(false)
        } catch (err) {
            console.log(err);
            return
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
                <WebView
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    originWhitelist={["*"]}
                    source={{...sourceHTML}}
                    style={{ marginTop: 20 }}
                    onNavigationStateChange={handleNavigationStateChange}
                    injectedJavaScript={`window.ReactNativeWebView.postMessage(document.getElementsByClassName('userBody')[0].innerHTML);`}
                    onMessage={(e) => handleMessage(e.nativeEvent.data)}
                />
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




