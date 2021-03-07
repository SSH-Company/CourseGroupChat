import React, { FunctionComponent, useContext } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Message } from 'react-native-gifted-chat'
import { UserContext } from '../../Auth/Login'

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
    const { user, setUser } = useContext(UserContext);

    return (
        <Message 
            {...props}
            key={`user-key-${props['user']['_id']}-${props['currentMessage'].displayStatus}`}
            renderBubble={() => {
                const currentMessage = props['currentMessage']
                const isCurrentUser = currentMessage.user._id === user._id
                return (
                    <>
                    <View style={[styles.item]}>
                        <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
                            <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{currentMessage.text}</Text>
                        </View>
                    </View>
                    {currentMessage.displayStatus && <Text>{currentMessage.status}</Text>}
                    </>
                )
            }}
        />
    )
}

export default CustomMessage


