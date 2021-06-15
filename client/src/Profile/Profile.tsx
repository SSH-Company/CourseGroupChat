import React, { useState, useEffect, useContext } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { ListItem, Image, Text, Button } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
import { FontAwesome5, Ionicons, Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../Auth/Login';
import { handleError } from '../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';



const deviceDimensions = Dimensions.get('window')

const style = StyleSheet.create({    
    imageContainer: {
        width: deviceDimensions.width,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30
    },
    imageStyle: {
        width: 150,
        height: 150,
        marginTop: 50,
        marginBottom: 25,
        borderRadius: 200
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 25
    },
    acceptContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        minWidth: 140,
    }
})

const Profile = ({ route, navigation }) => {
    const id = route.params.id;
    const { user } = useContext(UserContext);
    const [userInfo, setUserInfo] = useState<User>({} as User);
    const [friendStatus, setFriendStatus] = useState<{ sender: string | null, status: string | null }>({ sender: null, status: null });

    useEffect(() => {
        axios.get(`${BASE_URL}/api/profile/settings/${id}`)
            .then(res => {
                setUserInfo(res.data.user);
                setFriendStatus(res.data.friendStatus);
            })
            .catch(err => {
                handleError(err);
            })
    }, [id]);

    const addFriend = () => {
        axios.post(`${BASE_URL}/api/profile/friend-request`, { id: id })
            .then(() => setFriendStatus({...friendStatus, sender: user._id as string, status: 'PENDING'}))
            .catch(err => handleError(err));
    }

    const acceptRequest = () => {
        axios.put(`${BASE_URL}/api/profile/friend-request`, { id: id })
            .then(() => setFriendStatus({...friendStatus, status: 'ACCEPTED'}))
            .catch(err => handleError(err));
    }

    const cancelRequest = () => {
        axios.delete(`${BASE_URL}/api/profile/friend-request`, { data: { id: id }})
            .then(() => setFriendStatus({...friendStatus, status: null }))
            .catch(err => handleError(err));
    }

    const getRenderedStatus = (sender: string | null, status: string | null) => {
        if (status === "ACCEPTED") {
            return <Button 
                icon={(
                    <Ionicons
                        name="checkmark-outline"
                        size={15}
                        color="white"                        
                    />
                )}
                iconRight
                title="Friends"
            />
        } else if (status === "PENDING") {
            if (sender === user._id) {
                return <Button 
                    title="Pending"
                />
            } else {
                return (
                    <View style={style.acceptContainer}>
                        <Button 
                            title="Accept"
                            onPress={acceptRequest}
                        />
                        <Button 
                            title="Cancel"
                            onPress={cancelRequest}
                        />
                    </View>
                )
            }
        } else {
            return <Button 
                title="Add Friend"
                onPress={addFriend}
            />
        }
    }

    const iconSize = 20;
    const friendSettingsList = [
        {
            title: 'Mutual Friends',   
            icon: <FontAwesome5 name={"user-friends"} size={iconSize}/>,
            //onPress: , 
        },
        {
            title: 'Common Course Groups',   
            icon: <Ionicons name={"ios-chatbubbles"} size={iconSize}/>,
            //onPress: ,
        },
        {
            title: 'Mute Notifications',   
            icon: <Ionicons name={"notifications-off"} size={iconSize}/>,
            //onPress: ,
        },
        {
            title: 'Ignore Messages',  
            icon: <Entypo name={"block"} size={iconSize}/>
            //onPress
        },
        {
            title: 'Block',
            icon: <AntDesign name='exclamation' size={iconSize}/>,
            //onPress: () => { navigation.navigate('FriendRequests') }
        },
        {
            title: 'Unfriend', 
            icon: <MaterialCommunityIcons name={"account-cancel"} size={iconSize}/>
            //onPress:
        },
    ]

    const notFriendSettingsList = [
        {
            title: 'Mutual Friends',   
            icon: <FontAwesome5 name={"user-friends"} size={iconSize}/>,
            //onPress: , 
        },
        {
            title: 'Common Course Groups',   
            icon: <Ionicons name={"ios-chatbubbles"} size={iconSize}/>,
            //onPress: ,
        },
        {
            title: 'Block',
            icon: <AntDesign name='exclamation' size={iconSize}/>,
            //onPress: () => { navigation.navigate('FriendRequests') }
        }
    ]

    const getSettingsList = (status: string | null) => {
        if (status === "ACCEPTED") {
            return (                      
            <View>
              
                {friendSettingsList.map((item, i) => (
                    <ListItem key={i} onPress={item.onPress}>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
            )
        } else {return (                      
            <View>
              
                {notFriendSettingsList.map((item, i) => (
                    <ListItem key={i} onPress={item.onPress}>
                        {item.icon}
                        <ListItem.Content>
                            <ListItem.Title>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </View>
        )}
    }
    

    return (
        <View>
            <View style={style.imageContainer}>
                <Image
                    source={{ uri: userInfo.avatar as string || EMPTY_IMAGE_DIRECTORY }}
                    style={style.imageStyle}
                />
                <Text style={style.name}>{userInfo.name}</Text>
                {getRenderedStatus(friendStatus.sender, friendStatus.status)}
            </View>
            {getSettingsList(friendStatus.status)}
        </View>
    )
}

export default Profile



