import React, { useState, useContext } from 'react'
import { Dimensions, View, StyleSheet, Alert } from 'react-native';
import { Header, ListItem, Image, Text } from 'react-native-elements';
import { Entypo, Ionicons, MaterialIcons, Feather, AntDesign } from 'react-native-vector-icons';
import LightBox from 'react-native-lightbox';
import * as Notifications from 'expo-notifications';
import { Restart } from 'fiction-expo-restart';
import { Cache } from 'react-native-cache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../Auth/Login';
import { EMPTY_IMAGE_DIRECTORY, BASE_URL } from '../BaseUrl';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleError } from '../Util/CommonFunctions';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { FontAwesome5 } from '@expo/vector-icons';

const deviceDimensions = Dimensions.get('window')

const cache = new Cache ({
    namespace: "cirkle",
    policy: {
        maxEntries: 10
    },
    backend: AsyncStorage
});

const Settings = ({ navigation }) => {

    const [notification, setNotification] = useState(false);
    const { user } = useContext(UserContext);
    const [lightboxOpened, setLightboxopened] = useState(false);
    const dimensions = Dimensions.get('window');
    
    const styles = StyleSheet.create({ 
        imageStyle: {
            width: 70,
            height: 70,
            paddingLeft: 20,
            borderRadius: 200
        },
        componentStyle: {
            flex: 1, 
            textAlignVertical: 'center',
            justifyContent: 'center'
        }
    })

    // settingsList props.
    const iconSize = deviceDimensions.fontScale*15;

    const setNotifications = () => {
        if (!notification) {
            setNotification(true);
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
            console.log('notifications off');
        }
        else {
            setNotification(false);
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: false,
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                }),
            });
            console.log('notifications on');
        }
    }

    const handleLogout = () => {
        axios.delete(`${BASE_URL}/api/auth/logout`)
            .then(async () => {
                await cache.clearAll();
                Restart();
            })
            .catch(err => {
                handleError(err)
            })
    }

    const deleteAccount = () => {
        axios.delete(`${BASE_URL}/api/profile/user`)
        .then(handleLogout)
        .catch(err => console.log(err));
    }

    const TwoButtonAlert = () =>
    Alert.alert(
      "Delete Account",
      "Your account data will be deleted and cannot be restored. Are you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK",
        onPress: () => (deleteAccount())}
      ],
      { cancelable: false }
    );

    const sectionOne = [
        {
            title: 'My Friends',
            icon: <FontAwesome5 name="user-friends" size={iconSize-1}/>,
            onPress: () => navigation.navigate('Friends')
        },
        {
            title: 'Friend Requests',
            icon: <Ionicons name={"person-add"} size={iconSize}/>,
            onPress: () => navigation.navigate('FriendRequests')
        },
        {
            title: 'Course group chats',
            icon: <Feather name={"book-open"} size={iconSize}/>,
            onPress: () => navigation.navigate('CourseGroups')
        },
        {
            title: 'Spam',
            icon: <Ionicons name={"person-remove"} size={iconSize}/>,
            onPress: () => navigation.navigate('IgnoredGroups')
        },
        {
            title: 'Notifications & Sounds',
            icon: <Ionicons name={"notifications"} size={iconSize}/>,
            onPress: setNotifications
        }
    ]

    const sectionTwo = [        
        {
            title: 'FAQ',
            icon: <Entypo name={"help-with-circle"} size={iconSize}/>,
            onPress: () => Linking.openURL('https://cirkle.ca/faq')
        },
        {
            title: 'Contact Us',
            subtitle: 'Problem or questions? Let us know.',
            icon: <MaterialIcons name={"report"} size={iconSize}/>,
            onPress: () => navigation.navigate('ContactUs') 
        },        
        {
            title: 'Terms and Privacy Policy',
            icon: <MaterialIcons name={"policy"} size={iconSize}/>,
            onPress: () => Linking.openURL('https://cirkle.ca/legal')
        }
    ]

    const sectionThree = [        
        {
            title: 'Logout',
            icon: <MaterialIcons name={"logout"} size={iconSize}/>,
            key: `0-logout`,
            onPress: () => handleLogout()
        },
        {
            title: 'Delete Account',
            icon: <AntDesign name={"deleteuser"} size={iconSize}/>,
            onPress: () => TwoButtonAlert()
        }
    ]

    return (
        <View>
            <Header
                placement="left"
                backgroundColor={"white"}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                containerStyle={{ minHeight: 150 }}
                leftComponent={
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <AntDesign 
                            name="left" 
                            size={25} 
                            color={THEME_COLORS.ICON_COLOR}
                            style={{ paddingRight: 10 }} 
                            onPress={() => navigation.navigate('Main')}
                        />
                        <LightBox activeProps={{ resizeMode: 'contain', flex: 1, height: dimensions.height }} onOpen={() => setLightboxopened(true)} onClose={() => setLightboxopened(false)}>
                            <Image
                                source={{ uri: user.avatar || EMPTY_IMAGE_DIRECTORY }}
                                style={lightboxOpened ? {height: dimensions.height, width: dimensions.width, resizeMode: 'contain'} : styles.imageStyle}
                            />
                        </LightBox>
                    </View>
                }
                centerComponent={
                    <Text style={[styles.componentStyle, { fontWeight: 'bold', fontSize: deviceDimensions.fontScale*18 }]}>{user.name}</Text>
                }
                rightComponent={
                    <MaterialIcons 
                        name="edit" 
                        size={30}
                        style={[styles.componentStyle, { paddingRight: 12 }]} 
                        color={THEME_COLORS.ICON_COLOR} 
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                }
            />
            <View style={{ marginBottom: 50 }}>
                <Text style={{ marginLeft: deviceDimensions.scale*6, fontWeight: 'bold', fontSize: 16 * deviceDimensions.fontScale }}>Manage your Cirkle</Text>
                {sectionOne.map((item, i) => (
                    <ListItem key={`${i}-${item.title}`} onPress={item.onPress} style={{ marginLeft: deviceDimensions.scale*3}} bottomDivider>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title style={{ fontSize: 14 * deviceDimensions.fontScale }}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
            <View style={{ marginBottom: 50 }}>
                <Text style={{ marginLeft: deviceDimensions.scale*6, fontWeight: 'bold', fontSize: 16 * deviceDimensions.fontScale }}>Help and Support</Text>
                {sectionTwo.map((item, i) => (
                    <ListItem key={`${i}-${item}`} onPress={item.onPress} style={{ marginLeft: deviceDimensions.scale*3}} bottomDivider>
                        {item.icon}
                        <ListItem.Content style = {{}}>
                            <ListItem.Title style={{ fontSize: 14 * deviceDimensions.fontScale, textAlignVertical: 'center'}}>{item.title}</ListItem.Title>
                            {item.title === "Contact Us" ? (<ListItem.Subtitle style={{ fontSize: 12 * deviceDimensions.fontScale}}>{item.subtitle} </ListItem.Subtitle>): null}
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
            <View style={{ marginBottom: 50 }}>
                <Text style={{ marginLeft: deviceDimensions.scale*6, fontWeight: 'bold', fontSize: 16 * deviceDimensions.fontScale }}>Account</Text>
                {sectionThree.map((item, i) => (
                    <ListItem key={`${i}-${item}`} onPress={item.onPress} style={{ marginLeft: deviceDimensions.scale*3}} bottomDivider>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title style={{ fontSize: 14 * deviceDimensions.fontScale, textAlignVertical: 'center', color: i===(sectionThree.length - 1)? 'red': 'black'}}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
        </View>
    );
};

export default Settings;