import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ListItem, Image } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons';
import { navigate } from '../../Util/RootNavigation';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

type InboxSettingsProps = {
    group: User,
    onLeaveGroup: () => any
}

const InboxSettings = (props: InboxSettingsProps) => {

    //store device dimensions
    const deviceDimensions = Dimensions.get('window')

    const styles = StyleSheet.create({
        drawerContainer: {
            flex: 1,
            paddingTop: 30,
            width: deviceDimensions.width
        },
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

    const handleViewMembers = () => {
        navigate('GroupMembers', { id: props.group._id, name: props.group.name });
    }

    const handleLeaveGroup = () => {
        const reqBody = {
            grpId: props.group._id,
            leave: true
        }
        axios.delete(`${BASE_URL}/api/chat/remove-from-group`, { data: reqBody })
            .then(props.onLeaveGroup)
            .catch(err => console.log(err));
    }

    //Menu list components
    const iconSize = 20

    const list = [
        {
            title: 'Ignore group',
            icon: <Entypo name={"sound-mute"} size={iconSize}/>
        },
        {
            title: 'Group Members',
            icon: <MaterialIcons name={"groups"} size={iconSize}/>,
            onPress: handleViewMembers
        },
        {
            title: 'View photos and videos',
            icon: <AntDesign name={"picture"} size={iconSize}/>
        },
        {
            title: 'Search messages',
            icon: <Entypo name={"magnifying-glass"} size={iconSize}/>
        },
        {
            title: 'Leave Group',
            icon: <Ionicons name={"exit-outline"} size={iconSize}/>,
            onPress: handleLeaveGroup
        }
    ]
    
    return (
        <View style={styles.drawerContainer}>
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: props.group.avatar as string || EMPTY_IMAGE_DIRECTORY }}
                    style={styles.imageStyle}
                />
                <Text style={{paddingBottom: 10, fontSize: 25}}>{props.group.name}</Text>
            </View>
            {list.map((item, i) => (
                <ListItem key={i} onPress={item.onPress}>
                    {item.icon}
                    <ListItem.Content>
                    <ListItem.Title>{item.title}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.Chevron />
                </ListItem>
            ))}
        </View>
    );
}

export default InboxSettings

