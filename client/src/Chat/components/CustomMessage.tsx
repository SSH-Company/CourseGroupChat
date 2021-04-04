import React, { FunctionComponent, useContext, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Message } from 'react-native-gifted-chat';
import { Video } from 'expo-av';
import { UserContext } from '../../Auth/Login';

//style sheet
const styles = StyleSheet.create({
    item: {
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
    },
    video: {
        minWidth: 200,
        minHeight: 200,
        alignSelf: 'center'
    },
    status: {
        alignSelf: 'flex-end',
        fontSize: 10,
        color: 'grey'
    }
})

type CustomMessageProps = {
    children: any,
    onLongPress: (id: string) => any
}

const CustomMessage:FunctionComponent<CustomMessageProps> = (props) => {
    const { children, onLongPress } = props;
    const user = useContext(UserContext);
    const [displayStatus, setDisplayStatus] = useState<boolean>(false);

    const prepareStatusText = (status: string) => {
        const seenBy = status.split(',');
        if (seenBy.length === 0) return '';
        if (seenBy.length === 1) return 'Seen';
        if (seenBy.length > 1) return `Seen by ${status.slice(0, status.length -1)}`;
    }

    return (
        <Message 
            {...children}
            key={`user-key-${children['user']['_id']}-${displayStatus}`}
            renderBubble={() => {
                const currentMessage = children['currentMessage']
                const isCurrentUser = currentMessage.user._id === user._id
                
                return (
                    <View style={[styles.item]}>
                        <TouchableOpacity 
                            onPress={() => setDisplayStatus(!displayStatus)}
                            onLongPress={() => onLongPress(currentMessage._id)}
                        >
                            <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
                                    {currentMessage.text !== "" && <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{currentMessage.text}</Text>}
                                    {currentMessage.hasOwnProperty('image') && currentMessage.image.length > 0 && 
                                    (<Image
                                        source={{ uri: currentMessage.image }}
                                        style={{ width: 200, height: 200, marginBottom: 10 }}
                                    />)}
                                    {currentMessage.hasOwnProperty('video') && currentMessage.video.length > 0 &&
                                    (<Video
                                        style={styles.video}
                                        source={{ uri: currentMessage.video }}
                                        //TODO: find a good way to display loading icon
                                        // usePoster
                                        // posterSource={{ uri: `${BASE_URL}/media/loading_icon.jpg` }} 
                                        useNativeControls
                                        resizeMode="cover"
                                        isLooping
                                    />)}
                            </View>
                            {displayStatus && <Text style={styles.status}>{prepareStatusText(currentMessage.status)}</Text>}
                        </TouchableOpacity>
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


