import React, { useState, useEffect, useContext } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { Image, Text, Button } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import { UserContext } from '../Auth/Login';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

const style = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 200,
        marginBottom: 20
    },
    name: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 20
    }
})

const Profile = ({ route, navigation }) => {
    const id = route.params.id;
    const { user } = useContext(UserContext);
    const [userInfo, setUserInfo] = useState<User>({} as User);
    const [friendStatus, setFriendStatus] = useState<{ sender: string | null, status: string | null }>({ sender: null, status: null });

    useEffect(() => {
        axios.get(`${BASE_URL}/api/profile/${id}`)
            .then(res => {
                setUserInfo(res.data.user);
                setFriendStatus(res.data.friendStatus);
            })
            .catch(err => {
                console.log(err);
            })
    }, [id]);

    const addFriend = () => {
        axios.post(`${BASE_URL}/api/profile/add-friend`, { id: id })
            .then(() => setFriendStatus({...friendStatus, status: 'Pending'}))
            .catch(err => console.log(err));
    }

    const getRenderedStatus = (sender: string | null, status: string | null) => {
        if (status === "Accepted") {
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
        } else if (status === "Pending") {
            if (sender === user._id) {
                return <Button 
                    icon={(
                        <MaterialIcons
                            name="pending"
                            size={15}
                            color="white"
                        />
                    )}
                    iconRight
                    title="Pending"
                />
            } else {
                return <Button 
                    title="Accept request"
                />
            }
        } else {
            return <Button 
                title="Add Friend"
                onPress={addFriend}
            />
        }
    }

    return (
        <View style={style.container}>
            <Image
                source={{ uri: userInfo.avatar ? `${BASE_URL + userInfo.avatar}` : EMPTY_IMAGE_DIRECTORY }}
                style={style.image}
            />
            <Text style={style.name}>{userInfo.name}</Text>
            {getRenderedStatus(friendStatus.sender, friendStatus.status)}
        </View>
    )
}

export default Profile