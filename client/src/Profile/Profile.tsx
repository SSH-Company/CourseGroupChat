import React, { useState } from 'react'
import { Dimensions, View, StyleSheet } from 'react-native';
import { ListItem, Image, Text } from 'react-native-elements';
import { AntDesign, Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';
import * as VideoExtensions from 'video-extensions';
import * as Notifications from 'expo-notifications';
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

const Profile = ({ navigation }) => {
    const deviceDimensions = Dimensions.get('window')
    const [profilePicture, setProfilePicture] = useState({ uri: EMPTY_IMAGE_DIRECTORY });
    const [notification, setNotification] = useState(false);
    const [invalidImage, setInvalidImage] = useState(false);

    const styles = StyleSheet.create({ 
        imageContainer: {
            width: deviceDimensions.width,
            justifyContent: 'center',
            alignItems: 'center'
        },
        imageStyle: {
            width: 100,
            height: 100,
            marginTop: 50,
            marginBottom: 25,
            borderRadius: 200
        }
    })

    // settingsList props.
    const iconSize = 20;

    // image props.
    const imageProps = {
        name: 'Konnect Person'
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
                    setProfilePicture(imageRes);
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


    const settingsList = [
        // Daily use.
        {
            title: 'Dark Mode',         // TODO
            icon: <MaterialCommunityIcons name={"theme-light-dark"} size={iconSize}/>
        },
        // Preferences.
        {
            title: 'Notifications',     // Make a page
            icon: <Ionicons name={"notifications"} size={iconSize}/>,
            onPress: setNotifications,
        },
        // Account.
        {
            title: 'Personal Information',  // TODO
            icon: <Ionicons name={"person"} size={iconSize}/>
        },
        {
            title: 'Friend Requests',
            icon: <Ionicons name='person-add' size={iconSize}/>
        },
        {
            title: 'Blocked Users', // TODO
            icon: <MaterialCommunityIcons name={"block-helper"} size={iconSize}/>
        },
        // Misc.            || Fill out when we have relevant material.
        {
            title: 'Report Issue',
            icon: <AntDesign name={"exclamationcircleo"} size={iconSize}/>
        },
        {
            title: 'Help',
            icon: <AntDesign name={"questioncircleo"} size={iconSize}/>
        },
        {
            title: 'Legal & Policies',
            icon: <AntDesign name={"filetext1"} size={iconSize}/>
        }
    ]

    return (
        <View>
            <View style={styles.imageContainer}>
                {profilePicture && (
                <Image
                    source={{ uri: profilePicture.uri }}
                    style={styles.imageStyle}
                    onPress={uploadImage}
                />
                )}
                <Text style={{ paddingBottom: 10, fontSize: 25 }}>{imageProps.name}</Text>
            </View>
            {settingsList.map((item, i) => (
                <ListItem key={i} onPress={item.onPress}>
                    {item.icon}
                    <ListItem.Content>
                        <ListItem.Title>{item.title}</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            ))}
        </View>
    );
};

export default Profile;