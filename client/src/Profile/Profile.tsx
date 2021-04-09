import React, { useState } from 'react'
import { Dimensions, View, StyleSheet, Switch } from 'react-native';
import { ListItem, Image, Text, Header } from 'react-native-elements';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons';
import * as VideoExtensions from 'video-extensions';
import * as Notifications from 'expo-notifications';

import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";

const Profile = ( {navigation} ) => {
    const deviceDimensions = Dimensions.get('window')

    const [profilePicture, setProfilePicture] = useState({ uri: `https://placeimg.com/140/140/any` });
    const [notification, setNotification] = useState(false);

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
        name: 'Sultan\'s Dine'
    }

    // functionalities.
    const uploadImage = async () => {
        try {
            const status = await handlePermissionRequest("library");
            if (status === "granted") {
                const imageRes = await handleImagePick("library");
                if (imageRes) {
                    const fileExtension = imageRes.type.split('/')[1];
                    const mediaType = (VideoExtensions as any).default.includes(fileExtension) ? "video" : "image";
                    if (mediaType === "video") {
                        // TODO: handle wrong format uploads.
                        return;
                    }
                    setProfilePicture(imageRes);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    const setNotifications = () => {
        setNotification(true);

        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }


    const settingsList = [
        // Daily use.
        {
            title: 'Dark Mode',         // TODO
            icon: <MaterialIcons name={"groups"} size={iconSize}/>
        },
        // Preferences.
        {
            title: 'Notifications',     // NOW
            icon: <Ionicons name={"notifications"} size={iconSize}/>,
            onPress: setNotifications
        },
        // Account.
        {
            title: 'Personal Information',  // NOW
            icon: <Entypo name={"magnifying-glass"} size={iconSize}/>
        },
        {
            title: 'Security & Login',  // NOW
            icon: <Ionicons name={"heart"} size={iconSize}/>
        },
        {
            title: 'Blocked Users', // NOW
            icon: <Ionicons name={"settings-outline"} size={iconSize}/>
        },
        // Misc.            || Fill out when we have relevant material.
        {
            title: 'Report Issue',
            icon: <MaterialIcons name={"how-to-vote"} size={iconSize}/>
        },
        {
            title: 'Help',
            icon: <Ionicons name={"heart"} size={iconSize}/>
        },
        {
            title: 'Legal & Policies',
            icon: <Ionicons name={"settings-outline"} size={iconSize}/>
        }
    ]

    if (notification) {
        return (
            <View>
                <Header
                    centerComponent={{
                        text: "Notifications",
                        style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
                    }}
                />
            </View>
        )
    }
    return (    
        <View>
            <View style={styles.imageContainer}>
                { profilePicture && (
                <Image
                    source={{ uri: profilePicture.uri }}
                    style={ styles.imageStyle }
                    onPress={uploadImage}
                />
                )}
                <Text style={{ paddingBottom: 10, fontSize: 25 }}>{imageProps.name}</Text>
            </View>
            {settingsList.map((item, i) => (
                <ListItem key={i}>
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