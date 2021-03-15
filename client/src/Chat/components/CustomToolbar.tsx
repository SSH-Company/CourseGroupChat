import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { InputToolbar, Send } from 'react-native-gifted-chat';
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

type CustomToolbarProps = {
    children: any,
    onImagePick: (type: "library" | "camera") => any
}

const CustomToolbar:FunctionComponent<CustomToolbarProps> = (props) => {
    let {
        children,
        onImagePick = (type) => {}
    } = props;

    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setIsTyping(children.text.length > 0)
    }, [children.text])

    return (
        <View style={[style.container]}>
            <View style={[style.container]}>
                <InputToolbar 
                    {...children} 
                    containerStyle={style.inputbar} 
                    renderSend={() => (
                        <Entypo 
                            name={'image'} 
                            size={20} 
                            color='#734f96' 
                            style={style.clipIcon}
                            onPress={() => onImagePick("library")}
                        />
                    )}
                    renderActions={() => (
                        <SimpleLineIcons 
                            name={'camera'} 
                            size={20} 
                            color='#734f96' 
                            style={style.actionIcon}
                            onPress={() => onImagePick("camera")}
                        />
                    )}
                />
            </View>
            {isTyping ?
                <Send {...children}>
                    <MaterialCommunityIcons 
                        name={'send-circle'} 
                        color='#734f96' 
                        size={50} 
                        style={style.sendIcon}
                    />
                </Send>
                    :
                <Ionicons name={'mic-circle'} color='#734f96' size={50} style={style.micIcon}/>
            }
            
        </View>
    )
}

export default CustomToolbar


