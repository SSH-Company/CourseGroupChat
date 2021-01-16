import React, { FunctionComponent } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Avatar } from 'react-native-elements'
import { IMessage } from 'react-native-gifted-chat'

interface MessageProps extends IMessage {
    isCurrentUser: boolean
}

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

const Message:FunctionComponent<MessageProps> = (props) => {
    let { isCurrentUser } = props

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
        <View style={[styles.item, isCurrentUser ? styles.itemOut: styles.itemIn]}>
            <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
            <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{props.text}</Text>
            </View>
        </View>
    )
}

export default Message