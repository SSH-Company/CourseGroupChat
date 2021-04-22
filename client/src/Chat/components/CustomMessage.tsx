import React, { FunctionComponent, useContext, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Message } from 'react-native-gifted-chat';
import { Video } from 'expo-av';
import { UserContext } from '../../Auth/Login';
import { navigate } from '../../Util/RootNavigation';

//style sheet
const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'column'
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
    const { user } = useContext(UserContext);
    const [messagePressed, setMessagePressed] = useState<boolean>(false);

    const prepareStatusText = (status: string) => {
        const seenBy = status.split(', ').filter(i => i !== "" && i !== `${user.name.toUpperCase()}`);
        if (seenBy.length === 0) return 'Sent';
        if (seenBy.length === 1) {
            if (['Pending', 'Sent'].includes(seenBy[0])) return seenBy[0];
            else return 'Seen';
        }
        if (seenBy.length > 1) return `Seen by ${status.slice(0, status.length)}`;
    }

    return (
        <Message 
            {...children}
            key={`user-key-${children['user']['_id']}-${messagePressed}`}
            renderBubble={() => {
                const currentMessage = children['currentMessage']
                const isCurrentUser = currentMessage.user._id === user._id
                
                return (
                    <View style={[styles.item]}>

                        {/* handle texts */}
                        {currentMessage.text !== "" &&
                        <>
                        <TouchableOpacity 
                            onPress={() => setMessagePressed(!messagePressed)}
                            onLongPress={() => onLongPress(currentMessage._id)}
                        >     
                        <View style={[styles.balloon, {backgroundColor: isCurrentUser ? '#f5f9ff' : '#7c80ee'}]}>
                            <Text style={{paddingTop: 5, color:  isCurrentUser ? 'black' : 'white'}}>{currentMessage.text}</Text>
                        </View>
                        </TouchableOpacity>
                        <>
                        {messagePressed && <Text style={{...styles.status, alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'}}>
                            {prepareStatusText(currentMessage.status)}
                        </Text>}
                        </></>}

                        {/* handle images */}
                        {currentMessage.hasOwnProperty('image') && currentMessage.image.length > 0 && 
                        (<TouchableOpacity
                            onPress={() => navigate('FullScreenMedia', currentMessage.image)}
                            onLongPress={() => onLongPress(currentMessage._id)}
                        >       
                            <Image
                                source={{ uri: currentMessage.image }}
                                style={{ width: 200, height: 200, marginBottom: 10, borderRadius: 20 }}
                            />
                        </TouchableOpacity>)}

                        {/* handle videos */}
                        {currentMessage.hasOwnProperty('video') && currentMessage.video.length > 0 &&
                        (<View>
                            <Video
                                style={styles.video}
                                source={{ uri: currentMessage.video }}
                                //TODO: find a good way to display loading icon
                                // usePoster
                                // posterSource={{ uri: `${BASE_URL}/media/loading_icon.jpg` }} 
                                useNativeControls
                                resizeMode="cover"
                                isLooping
                            />
                        </View>)}
                    </View>
                )
            }}
        />
    )
}

export default CustomMessage


