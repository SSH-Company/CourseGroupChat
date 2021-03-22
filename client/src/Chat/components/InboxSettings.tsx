import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { ListItem, Image } from 'react-native-elements'
import { User } from 'react-native-gifted-chat'
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons'
import BASE_URL from '../../../BaseUrl';
import axios from 'axios';

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

    const handleLeaveGroup = () => {
        axios.delete(`${BASE_URL}/api/group/leave-group/${props.group._id}`)
            .then(props.onLeaveGroup)
            .catch(err => console.log(err));
    }

    //Menu list components
    const iconSize = 20

    const list = [
        {
            title: 'Mute',
            icon: <Entypo name={"sound-mute"} size={iconSize}/>
        },
        {
            title: 'Member list',
            icon: <MaterialIcons name={"groups"} size={iconSize}/>
        },
        {
            title: 'Gallery',
            icon: <AntDesign name={"picture"} size={iconSize}/>
        },
        {
            title: 'Calendar',
            icon: <Entypo name={"calendar"} size={iconSize}/>
        },
        {
            title: 'Search messages',
            icon: <Entypo name={"magnifying-glass"} size={iconSize}/>
        },
        {
            title: 'Polls',
            icon: <MaterialIcons name={"how-to-vote"} size={iconSize}/>
        },
        {
            title: 'Popular',
            icon: <Ionicons name={"heart"} size={iconSize}/>
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
                    source={{ uri: props.group.avatar as string }}
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

