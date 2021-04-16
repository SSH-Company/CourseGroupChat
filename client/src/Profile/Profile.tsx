import React, { useState, useEffect } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import { Image, Text } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
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
        fontSize: 20
    }
})

const Profile = ({ route, navigation }) => {
    const id = route.params.id;

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
        <View style={style.container}>
            <Image
                source={{ uri: userInfo.avatar ? `${BASE_URL + userInfo.avatar}` : EMPTY_IMAGE_DIRECTORY }}
                style={style.image}
            />
            <Text style={style.name}>{userInfo.name}</Text>
        </View>
    )
}

export default Profile