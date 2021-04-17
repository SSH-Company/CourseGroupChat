import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { InputToolbar, Send, Actions } from 'react-native-gifted-chat';
import { Entypo, SimpleLineIcons, Ionicons, MaterialCommunityIcons, AntDesign } from 'react-native-vector-icons';

const style = StyleSheet.create({
    outer_container: {
        display:'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 0,
    },
    toolbar_container: {
        display:'flex',
        flex: 1,
        
    },
    //input toolbar
    inputbar: {
        backgroundColor: '#f0f0f0',
        paddingTop: 0,
        borderRadius: 25,
        marginLeft: 10,
    },
    actionContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
        marginRight: 4,
        marginBottom: 0,       
    },
    //button icons
    camera_icon: {
        alignSelf: 'center',
        marginLeft: 10,
        marginTop: 8
    },
    right_icon: {
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5
    },
    send_icon: {
        alignSelf: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 5
    },
    mic_icon: {
        alignSelf: 'center',
        height: 20
    },
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
        <View style={style.outer_container}>
            <View>
                <AntDesign
                    name="camera"
                    color='#734f96'
                    size={27}
                    style={style.camera_icon}
                    onPress={()=>onImagePick('camera')}
                />
            </View>
            <View style={style.toolbar_container}>
                <InputToolbar 
                    {...children} 
                    containerStyle={style.inputbar} 
                    renderSend={() => (
                        <Ionicons 
                            name={'mic-circle'} 
                            color='#734f96' 
                            size={30}
                            style={style.camera_icon}
                        /> 
                    )}
                />
            </View>
            <View>
            {isTyping?
                <Send {...children}>
                    <MaterialCommunityIcons 
                        name={'send-circle'} 
                        color='#734f96' 
                        size={35} 
                        style={style.send_icon}
                    />
                </Send>
                    :
                <Entypo 
                    name={'images'} 
                    color='#734f96' 
                    size={30} 
                    style={style.right_icon}
                    onPress={()=>onImagePick('library')}
                /> 
            }
            </View>
        </View>
    )
}

export default CustomToolbar


