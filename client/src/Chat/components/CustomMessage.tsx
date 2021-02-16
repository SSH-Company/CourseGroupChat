import React, { FunctionComponent, useContext } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Avatar, Image } from 'react-native-elements'
import { Message } from 'react-native-gifted-chat'
import { UserContext } from '../../Auth/Login'
import { Ionicons } from 'react-native-vector-icons'

//style sheet
const styles = StyleSheet.create({
    item: {
        marginVertical: 5,
        flexDirection: 'row'
    },
    itemIn: {
        alignSelf: 'flex-start',
        marginLeft: 10
    },
    itemOut: {
        alignSelf: 'flex-end',
        marginRight: 10
    },
    balloon: {
        maxWidth: 250,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 15,
        borderRadius: 20
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 3,
    },
    ticks: {
        alignSelf: 'flex-end',
        color: '#734f96'
    }
})

const CustomMessage:FunctionComponent = (props) => {
    
    const userID = useContext(UserContext)
    
    //TODO: rendering avatar
    const renderAvatar = (avatarProps: any) => {
        const user = avatarProps.user
        if (user) {
            return (
                <Avatar 
                    rounded 
                    source={{
                        uri: user.avatar
                    }}
                    containerStyle={styles.avatar}
                />
            )
        }
    }

    return (
        <Message 
            {...props}
            key={`user-key-${props['user']['_id']}`}
            renderBubble={() => {
                const currentMessage = props['currentMessage']
                const isCurrentUser = currentMessage.user._id === userID._id
                return (
                    <View style={[styles.item]}>
                        <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
                            <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{currentMessage.text}</Text>
                        </View>
                        {currentMessage.received && <Ionicons name={'checkmark-done-circle'} size={20} style={styles.ticks}/>}
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


