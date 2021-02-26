import React, { FunctionComponent, useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { InputToolbar, Send } from 'react-native-gifted-chat'
import { Entypo, SimpleLineIcons, Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';

const style = StyleSheet.create({
    container: {
        display:'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    //input toolbar
    inputbar: {
        backgroundColor: '#f0f0f0',
        borderTopWidth: 0,
        borderRadius: 30,
        marginBottom: 10,
        marginLeft: 10
    },
    //button icons
    actionIcon: {
        marginLeft: 10,
        marginRight: 12,
        alignSelf: 'center',
    },
    micIcon: {
        alignSelf: 'center',
        marginBottom: 20
    },
    sendIcon: {
        alignSelf: 'center',
        marginBottom: 8
    },
    clipIcon: {
        alignSelf: 'center',
        marginRight: 15
    }
})

const CustomToolbar:FunctionComponent = (props: any) => {

    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setIsTyping(props.text.length > 0)
    }, [props.text])

    return (
        <View style={[style.container]}>
            <View style={[style.container]}>
                <InputToolbar 
                    {...props} 
                    containerStyle={style.inputbar} 
                    renderSend={() => (
                        <Entypo name={'image'} size={20} color='#734f96' style={style.clipIcon}/>
                    )}
                    renderActions={() => (
                        <SimpleLineIcons name={'camera'} size={20} color='#734f96' style={style.actionIcon}/>
                    )}
                />
            </View>
            {isTyping ?
                <Send {...props}>
                    <MaterialCommunityIcons name={'send-circle'} color='#734f96' size={50} style={style.sendIcon}/>
                </Send>
                    :
                <Ionicons name={'mic-circle'} color='#734f96' size={50} style={style.micIcon}/>
            }
            
        </View>
    )
}

export default CustomToolbar


