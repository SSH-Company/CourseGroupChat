import React, { FunctionComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Avatar } from 'react-native-elements'
import { Message } from 'react-native-gifted-chat'

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
})

const CustomMessage:FunctionComponent = (props) => {

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
                const isCurrentUser = Object.keys(currentMessage.user).length === 0
                return (
                    <View style={[styles.item]}>
                        <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
                        <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{currentMessage.text}</Text>
                        </View>
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


