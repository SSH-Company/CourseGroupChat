import React, { useEffect, useState, createContext } from 'react';
import { 
    View,
    ActivityIndicator,
} from 'react-native';
import { Header } from "react-native-elements";
import { Cache } from 'react-native-cache';
import * as Notifications from 'expo-notifications';
import { Restart } from 'fiction-expo-restart';
import { handleError } from '../Util/CommonFunctions';
import Auth, { FormData } from './Auth';
import Unverified from './Unverified';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from "../BaseUrl";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [user, setUser] = useState({} as any);
    const [verifiedUser, setVerifiedUser] = useState<'Y' | 'N'>('N');
    const [pageType, setPageType] = useState<"login" | "signup">("login");
    const userContextValue = { user, setUser };

    useEffect(() => {
        checkIfUserLoggedIn();
    }, [])

    const checkIfUserLoggedIn = async () => {
        try {
            //check if users data can be found in phone storage
            const email = await cache.get('email'),
            password = await cache.get('password')
            if (email?.length > 0 && password?.length > 0) {
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

    const handleLogout = async () => {
        await cache.clearAll();
        Restart();
    }

    if (loading) {
        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="left"
                    backgroundColor={THEME_COLORS.HEADER}
                    statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                    containerStyle={{ minHeight: 100 }}
                />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator color="blue"/>
                </View>
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
                    <Unverified userId={user._id} handleLogout={handleLogout}/>
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






