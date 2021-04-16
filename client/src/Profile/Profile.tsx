import React, { useState, useEffect } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { Image, Text } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

const Profile = ({ route, navigation }) => {
    const id = route.params;

    const [userInfo, setUserInfo] = useState<User>({} as User);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/profile/${id}`)
            .then(res => {
                setUserInfo(res.data);
            })
            .catch(err => {
                console.log(err);
            })
    }, [id]);

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={{ uri: userInfo.avatar ? `${BASE_URL + userInfo.avatar}` : EMPTY_IMAGE_DIRECTORY }}
                style={{ width: 400, height: 400, marginBottom: 10 }}
            />
            <Text style={{ fontWeight: 'bold' }}>{userInfo.name}</Text>
        </View>
    )
}

export default Profile