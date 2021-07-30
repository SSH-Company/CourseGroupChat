import React from 'react';
import { Alert, View, Text, StyleSheet, Dimensions } from 'react-native';
import { ListItem, Image, Button } from 'react-native-elements';
import { User } from 'react-native-gifted-chat';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons';
import GroupAvatar from './GroupAvatar';
import { navigate } from '../RootNavigation';
import { handleIgnoreGroup, handleJoinCourseGroup } from '../CommonFunctions';
import { handleLeaveGroup } from '../CommonFunctions';
import { EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import { ChatLog } from '../ChatLog';

type InboxSettingsProps = {
    group: User,
    verified: "Y" | "N",
    newToGroup: boolean,
    onMuteNotifications?: (visible: boolean) => any,
    onLeaveGroup?: () => any
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
            marginTop: 50,
            marginBottom: 25,
            borderRadius: 200
        }
    })

    const alertUser = () => {
        Alert.alert(
            "Ignore this conversation?",
            `You won't be notified when someone sends a message to this group, and the conversation will move to Spam. We won't tell other members of the group they are being ignored.`,
            [{ text: "CANCEL", onPress: () =>  console.log('cancelled') },
            { text: "IGNORE", onPress: () => handleIgnoreGroup(props.group._id as string, () => navigate('Main', {})) }]
        )
    }

    //Menu list components
    const iconSize = 20

    const verifiedGroupOptions = [
        {
            title: 'Course Feedback',
            icon: <MaterialIcons name={"feedback"} size={iconSize}/>,
            onPress: () => navigate('Feedback', { course: props.group.name })
        }
    ];

    const list = [
        {
            title: 'Mute notifications',
            icon: <Ionicons name={"notifications-off-circle"} size={iconSize}/>,
            onPress: () => props.onMuteNotifications(true)
        },
        {
            title: 'Ignore group',
            icon: <Entypo name={"sound-mute"} size={iconSize}/>,
            onPress: alertUser
        },
        {
            title: 'Group Members',
            icon: <MaterialIcons name={"groups"} size={iconSize}/>,
            onPress: () => navigate('GroupMembers', { id: props.group._id, name: props.group.name })
        },
        {
            title: 'View photos and videos',
            icon: <AntDesign name={"picture"} size={iconSize}/>,
            onPress: () => navigate('Gallery', props.group._id)
        },
        {
            title: 'Leave Group',
            icon: <Ionicons name={"exit-outline"} size={iconSize}/>,
            onPress: () => handleLeaveGroup([], props.group._id as string, true, props.onLeaveGroup)
        }
    ]

    const newToGroupOptions = [
        {
            title: 'Group Members',
            icon: <MaterialIcons name={"groups"} size={iconSize}/>,
            onPress: () => navigate('GroupMembers', { id: props.group._id, name: props.group.name })
        }
    ]

    const allOptions = props.verified === "Y" ? verifiedGroupOptions.concat(list) : list;
    
    return (
        <View style={styles.drawerContainer}>
            <View style={styles.imageContainer}>
                {props.verified === "Y" ?
                    <GroupAvatar
                        name={props.group.name}
                        verified={"Y"}
                        size={100}
                        style={styles.imageStyle}
                    />
                    :
                    <Image 
                        source={{ uri: props.group.avatar as string || EMPTY_IMAGE_DIRECTORY }}
                        style={[styles.imageStyle, { width: 100, height: 100 }]}
                    />
                }
                <Text style={{paddingBottom: 10, fontSize: 25}}>{props.group.name}</Text>
            </View>
            {props.newToGroup ?
                <View style={{ alignContent: 'center', justifyContent: 'center' }}>
                    <Button title="Join Group" containerStyle={{ alignSelf: 'center', justifyContent: 'center', padding: 10 }} onPress={() => handleJoinCourseGroup(props.group._id as string, async () => {
                        await ChatLog.getChatLogInstance(true);
                        navigate('Main', {})
                    })}/>
                    {newToGroupOptions.map((item, i) => (
                        <ListItem key={i} onPress={item.onPress}>
                            {item.icon}
                            <ListItem.Content>
                            <ListItem.Title>{item.title}</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.Chevron />
                        </ListItem>
                    ))}
                </View>
                :
                allOptions.map((item, i) => (
                    <ListItem key={i} onPress={item.onPress}>
                        {item.icon}
                        <ListItem.Content>
                        <ListItem.Title>{item.title}</ListItem.Title>
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                ))
            }
        </View>
    );
}

export default InboxSettings

