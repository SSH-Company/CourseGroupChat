import React, { useState, useContext } from 'react'
import { Dimensions, View, StyleSheet } from 'react-native';
import { Header, ListItem, Image, Text } from 'react-native-elements';
import { Entypo, Ionicons, MaterialIcons, Feather } from 'react-native-vector-icons';
import Lightbox from 'react-native-lightbox';
import { StatusBar } from 'expo-status-bar';
import * as VideoExtensions from 'video-extensions';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../Auth/Login';
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const Settings = ({ navigation }) => {

    const deviceDimensions = Dimensions.get('window')
    const [notification, setNotification] = useState(false);
    const { user, setUser } = useContext(UserContext);
    const [profilePicture, setProfilePicture] = useState<any>({ uri: user.avatar });
    const [invalidImage, setInvalidImage] = useState(false);
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
            textAlignVertical: 'center'
        }
    })

    // settingsList props.
    const iconSize = 15;

    const sendData = (image: any) => {
        const formData = new FormData();
        formData.append('avatar', {...image})

        axios.post(`${BASE_URL}/api/profile/upload-profile-pic`, formData, { headers: { 'content-type': 'multipart/form-data' } })
        .then(res => {
            const newAvatar = res.data.path;
            setUser({
                ...user,
                avatar: newAvatar || profilePicture.uri
            });
            return;
        })
        .catch(err => {
            console.log(err);
        })
    }

    // functionalities.
    const uploadImage = async () => {
        try {
            setInvalidImage(false);
            const status = await handlePermissionRequest("library");
            if (status === "granted") {
                const imageRes = await handleImagePick("library");
                if (imageRes) {
                    const fileExtension = imageRes.type.split('/')[1];
                    const mediaType = (VideoExtensions as any).default.includes(fileExtension) ? "video" : "image";
                    if (mediaType === "video") {
                        setInvalidImage(true);
                        return;
                    }
                    setProfilePicture({...imageRes});
                    sendData(imageRes);
                } 
            }
        } catch (err) {
            console.log(err);
        }
    }

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

    const sectionOne = [
        {
            title: 'Friend Requests',
            icon: <Ionicons name={"person-add"} size={iconSize}/>,
            onPress: () => navigation.navigate('FriendRequests')
        },
        {
            title: 'Course group chats',
            icon: <Feather name={"book-open"} size={iconSize}/>,
            onPress: () => console.log('course group chats')
        },
        {
            title: 'Notifications & Sounds',
            icon: <Ionicons name={"notifications"} size={iconSize}/>,
            onPress: setNotifications
        }
    ]

    const sectionTwo = [
        {
            title: 'Account settings',
            icon: <Feather name={"settings"} size={iconSize}/>,
            onPress: () => console.log('account settings')
        },
        {
            title: 'Report a problem',
            icon: <MaterialIcons name={"report"} size={iconSize}/>,
            onPress: () => console.log('report problem')
        },
        {
            title: 'Help',
            icon: <Entypo name={"help-with-circle"} size={iconSize}/>,
            onPress: () => console.log('help')
        },
        {
            title: 'Policies',
            icon: <MaterialIcons name={"policy"} size={iconSize}/>,
            onPress: () => console.log('policies')
        }
    ]

    return (
        <View>
            <StatusBar style="light" backgroundColor={THEME_COLORS.STATUS_BAR}/>
            {profilePicture && (
                <Header
                    placement="left"
                    backgroundColor={"white"}
                    leftComponent={
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons 
                                name="arrow-back-sharp" 
                                size={25} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.navigate('Main')}
                            />
                            <Lightbox activeProps={{ resizeMode: 'contain', flex: 1, height: dimensions.height }} onOpen={() => setLightboxopened(true)} onClose={() => setLightboxopened(false)}>
                                <Image
                                    source={{ uri: profilePicture.uri || EMPTY_IMAGE_DIRECTORY }}
                                    style={lightboxOpened ? {height: dimensions.height, width: dimensions.width, resizeMode: 'contain'} : styles.imageStyle}
                                />
                            </Lightbox>
                        </View>
                    }
                    centerComponent={
                        <Text style={[styles.componentStyle, { fontWeight: 'bold', fontSize: 20 }]}>{user.name}</Text>
                    }
                    rightComponent={
                        <MaterialIcons 
                            name="edit" 
                            size={30}
                            style={styles.componentStyle} 
                            color={THEME_COLORS.ICON_COLOR} 
                            onPress={() => navigation.navigate('Main')}
                        />
                    }
                />
            )}
            <View style={{ marginBottom: 50 }}>
                {sectionOne.map((item, i) => (
                    <ListItem key={`${i}-${item.title}`} onPress={item.onPress} bottomDivider>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title style={{ fontSize: 15 }}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
            <View style={{ marginBottom: 50 }}>
                <Text style={{ marginLeft: 5, fontWeight: 'bold', fontSize: 18 }}>Account and Support</Text>
                {sectionTwo.map((item, i) => (
                    <ListItem key={`${i}-${item.title}`} onPress={item.onPress} bottomDivider>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title style={{ fontSize: 15 }}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
            <View>
                <ListItem key={`0-logout`} onPress={() => console.log('logout')} bottomDivider>
                    <MaterialIcons 
                        name="logout" 
                        size={20}
                    />
                    <ListItem.Content>
                        <ListItem.Title style={{ fontSize: 15 }}>Logout</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            </View>
        </View>
    );
};

export default Settings;