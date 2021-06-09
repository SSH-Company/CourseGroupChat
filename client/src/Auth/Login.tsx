import React, { useEffect, useState, createContext } from 'react';
import { 
    // AppState,
    // StyleSheet,
    View,
    // Platform,
    // Image,
    Text,
    ActivityIndicator,
    Alert
} from 'react-native';
// import { User } from 'react-native-gifted-chat';
// import { WebView } from 'react-native-webview';
import { Cache } from 'react-native-cache';
import * as Notifications from 'expo-notifications';
// import Constants from 'expo-constants';
import { ChatLog } from '../Util/ChatLog';
import Auth, { FormData } from './Auth';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from "../BaseUrl";
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };
import AsyncStorage from '@react-native-async-storage/async-storage';

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: 'center'
//     },
//     horizontal: {
//         flexDirection: "row",
//         justifyContent: "space-around"
//     },
//     image: {
//         flex: 1,
//         resizeMode: "contain",
//         justifyContent: "center"
//     }
// });

export const UserContext = createContext({
    user: {} as any,
    setUser: (obj: any) => {}
})

// cache to hold expo token.
const cache = new Cache ({
    namespace: "cirkle",
    policy: {
        maxEntries: 10
    },
    backend: AsyncStorage
});

// notification handler.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });  

const LogIn = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [newUser, setNewUser] = useState(false)
    const [user, setUser] = useState({});
    const [verifiedUser, setVerifiedUser] = useState<'Y' | 'N'>('N');
    const [pageType, setPageType] = useState<"login" | "signup">("login");
    // const [sourceHTML, setSourceHTML] = useState<any>();
    // const appState = useRef(AppState.currentState);
    // const [expoPushToken, setExpoPushToken] = useState('');
    // const responseListener = useRef<any>(null);
    const userContextValue = { user, setUser };
    // const splash_iphone = '../../assets/iphoneX.png';
    // const splash_ipad = '../../assets/ipad.png';

    useEffect(() => {
        checkIfUserLoggedIn();
    }, [])

    const checkIfUserLoggedIn = async () => {
        try {
            //check if users data can be found in phone storage
            const email = await cache.get('email'),
            password = await cache.get('password')
            if (email && password) {
                handleSubmit({ email, password }, "login");
            } else {
                setNewUser(true);
                setLoading(false);
                return;
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleSubmit = async (form: FormData, pageType: "login" | "signup") => {
        //re login the user
        axios.post(`${BASE_URL}/api/auth/${pageType}`, {...form})
            .then(async res => {
                setUser({
                    ...res.data,
                    avatar: res.data.avatar || EMPTY_IMAGE_DIRECTORY
                });
                await cache.set('email', res.data.email);
                await cache.set('password', res.data.password);
                if (pageType === "login") await ChatLog.getChatLogInstance(true, res.data._id);
                setVerifiedUser(res.data.verified);
                setNewUser(false);
            })
            .catch(err => {
                handleError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const handleError = (error: any) => {
        const response = error.response;
        if (response) {
            switch(response.status) {
                case 400:
                    Alert.alert(
                        'There was an error!',
                        response.data.message
                    )
                    break;
                case 409:
                    Alert.alert(
                        'There was an error!',
                        response.data.message
                    )
                    break;
                default: 
                    console.error(response.data)
                    break;
            }
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="blue"/>
            </View>
        )
    } else {
        if (newUser) {
            //return login/ signup page
            return (
                <Auth 
                    pageType={pageType}
                    handlePageTypeSwitch={() => setPageType(type => { return (type === "login" ? "signup" : "login") })}
                    handleSubmit={(form) => handleSubmit(form, pageType)}
                />
            )
        } else {
            if (verifiedUser === 'Y') {
                return (
                    <UserContext.Provider value={userContextValue}>
                        {children}
                    </UserContext.Provider>
                )
            } else {
                //return unverified page
                return (
                    <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 25, textAlign: 'center', textAlignVertical: 'center' }}>
                            Looks like your account isn't verified. Please retry after verifying your email.
                        </Text>
                    </View>
                )
            }
        }
    }



    /*******************************************Below code used for saml****************************************************/
    /*
        How it works:
        A request is sent to the backend where there is a Middleware check
        to ensure the user is logged in. If they aren't, a 302 status code
        is returned, where the redirect url can be used to open a WebView for 
        the user to login. After user verification is successful, the WebView 
        redirects to a page from where the User's database information is collected
        and stored. The user is then redirected to the Main page.
    */
    

    // useEffect(() => {
    //     AppState.addEventListener("change", handleAppStateChange);

    //     return () => {
    //         AppState.removeEventListener("change", handleAppStateChange);
    //     }
    // }, [])

    // // put inside login so it only checks for/generates token once per app init.
    // // useEffect(() => {
    // //     // notifications.
    // //     registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    
    // //     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
    // //       console.log(response);
    // //     });
    
    // //     return () => {
    // //       Notifications.removeNotificationSubscription(responseListener);
    // //     };
    // // }, []);

    // const handleLogin = (email: string) => {
    //     axios.get(`${BASE_URL}/api/auth`, { params: { email } }) //{ params: { email: 'email address here' } }
    //         .then(res => {
    //             tempFunc(res.data);
    //             // setSourceHTML({ html: res.data });
    //             // setNewUser(true);
    //             // setLoading(false);
    //         })
    //         .catch(err => {
    //             const response = err.response;
    //             if (response) {
    //                 switch (response.status) {
    //                     case 302:
    //                         setNewUser(true);
    //                         setSourceHTML({ uri: response.data.redirect });
    //                         setLoading(false);
    //                         break;
    //                     default:
    //                         break;
    //                 }
    //             }
    //         })
    // }

    // const tempFunc = async (user) => {
    //     setUser({
    //         _id: user.ID,
    //         name: user.FIRST_NAME + ' ' + user.LAST_NAME,
    //         avatar: user.AVATAR || EMPTY_IMAGE_DIRECTORY,
    //         email: user.EMAIL
    //     })
    //     await ChatLog.getChatLogInstance(true, user.ID);
    //     setNewUser(false);
    //     setLoading(false);
    // }
    
    // // setup function for expo notifications.
    // const registerForPushNotificationsAsync = async () => {
    //     let token;
    //     if (Constants.isDevice) {
    //         try {
    //             const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //             let finalStatus = existingStatus;
    //             if (existingStatus !== 'granted') {
    //                 const { status } = await Notifications.requestPermissionsAsync();
    //                 finalStatus = status;
    //             }
    //             if (finalStatus !== 'granted') {
    //                 alert('Failed to get push token for push notification!');
    //                 return;
    //             }
    //             //TODO: investigate why this function is generating an error
    //             token = (await Notifications.getExpoPushTokenAsync()).data;
    //             console.log(token);
    //         } catch (err) {
    //             console.log(err)
    //             return
    //         }

    //     } else {
    //         alert('Must use physical device for Push Notifications');
    //     }

    //     if (Platform.OS === 'android') {
    //         Notifications.setNotificationChannelAsync('default', {
    //             name: 'default',
    //             importance: Notifications.AndroidImportance.MAX,
    //             vibrationPattern: [0, 250, 250, 250],
    //             lightColor: '#FF231F7C',
    //         });
    //     }
    //     /* send token to backend for storage here */
    //     if (token) {
    //         axios.post(`${BASE_URL}/api/notification`, {expoToken: token})
    //         .then(res => {
    //             console.log('successfully sent expo token to backend')
    //         })
    //         .catch(e => {
    //             console.log('expo token error:', e.response.data)
    //         })
    //     } else {
    //         console.log('no expo token generated')
    //     }

    //     return token;
    // }

    // const handleAppStateChange = (nextAppState) => {
    //     appState.current = nextAppState
    // }

    // const handleNavigationStateChange = (state) => {
    //     // console.log(state);
    // }

    // const handleMessage = async (msg: string) => {
    //     try {
    //         const user = JSON.parse(msg);
    //         await ChatLog.getChatLogInstance(true, user.ID); 
    //         setUser({
    //             _id: user.ID,
    //             name: user.FIRST_NAME + ' ' + user.LAST_NAME,
    //             avatar: user.AVATAR || EMPTY_IMAGE_DIRECTORY
    //         })
    //         //redirect to Main
    //         setNewUser(false)
    //     } catch (err) {
    //         console.log(err);
    //         return
    //     }
    // }

    // if (loading) {
    //     return (
    //         <Welcome onSubmitPress={email => handleLogin(email)}/>
    //     )
    // } else {
    //     if (newUser) {
    //         return (
    //             <WebView
    //                 javaScriptEnabled={true}
    //                 domStorageEnabled={true}
    //                 originWhitelist={["*"]}
    //                 source={{...sourceHTML}}
    //                 style={{ marginTop: 30 }}
    //                 onNavigationStateChange={handleNavigationStateChange}
    //                 injectedJavaScript={`window.ReactNativeWebView.postMessage(document.getElementsByClassName('userBody')[0].innerHTML);`}
    //                 onMessage={(e) => handleMessage(e.nativeEvent.data)}
    //             /> 
    //         )
    //     } else {
    //         return (
    //             <UserContext.Provider value={userContextValue}>
    //                 {children}
    //             </UserContext.Provider>
    //         )
    //     }
    // }
}

export default LogIn






