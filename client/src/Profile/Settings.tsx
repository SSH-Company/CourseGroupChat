import React, { useState, useContext } from 'react'
import { Dimensions, View, StyleSheet } from 'react-native';
import { Header, ListItem, Image, Text } from 'react-native-elements';
import { Entypo, Ionicons, MaterialIcons, Feather, AntDesign } from 'react-native-vector-icons';
import LightBox from 'react-native-lightbox';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../Auth/Login';
import { EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

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
            textAlignVertical: 'center'
        }
    })

    // settingsList props.
    const iconSize = 15;

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
            onPress: () => navigation.navigate('CourseGroups')
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
                    <Text style={[styles.componentStyle, { fontWeight: 'bold', fontSize: 20 }]}>{user.name}</Text>
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
                <Text style={{ marginLeft: 5, fontWeight: 'bold', fontSize: 18 }}>Manage your Cirkle</Text>
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