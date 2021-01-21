import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { ListItem } from 'react-native-elements'
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons'

const ChatSettings = () => {

    const styles = StyleSheet.create({
        drawerContainer: {
            flex: 1,
            paddingTop: 30,
        }
    })

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
            title: 'Popular',
            icon: <Ionicons name={"heart"} size={iconSize}/>
        },
        {
            title: 'Settings',
            icon: <Ionicons name={"settings-outline"} size={iconSize}/>
        }
    ]
    
    return (
        <View style={styles.drawerContainer}>
            {list.map((item, i) => (
                <ListItem key={i}>
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

export default ChatSettings