import React, { FunctionComponent, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { InputToolbar, Send } from 'react-native-gifted-chat';
import { Entypo, SimpleLineIcons, Ionicons, MaterialCommunityIcons } from 'react-native-vector-icons';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';

const style = StyleSheet.create({
    outerContainer: {
        display:'flex',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    innerContainer: { 
        display: 'flex',
        flex: 1,
        flexDirection:'row',
        marginBottom: 8 
    },
    //input toolbar
    inputbar: {
        backgroundColor: '#f0f0f0',
        alignSelf: 'flex-end',
        borderTopWidth: 0,
        borderRadius: 30,
        marginRight: 10
    },
    //button icons
    actionIcon: {
        marginLeft: 10,
        alignSelf: 'flex-start',
    },
    clipIcon: {
        marginLeft: 10,
        alignSelf: 'flex-start'
    }
})

type CustomToolbarProps = {
    children: any,
    onImagePick: (type: "library" | "camera") => any,
    onDocumentPick: () => any
}

const CustomToolbar:FunctionComponent<CustomToolbarProps> = (props) => {
    let {
        children,
        onImagePick = (type) => {},
        onDocumentPick = () => {}
    } = props;

    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setIsTyping(children.text.length > 0)
    }, [children.text])

    return (
        <View style={[{...style.outerContainer, position: isTyping ? 'relative' : 'absolute', bottom: isTyping ? null : 1 }]}>
            <InputToolbar 
                {...children} 
                containerStyle={{...style.inputbar, marginLeft: isTyping ? 10 : 110}}
                renderSend={() => 
                    isTyping ?
                        <Send {...children}>
                            <MaterialCommunityIcons 
                                name={'send-circle'} 
                                color={THEME_COLORS.ICON_COLOR} 
                                size={40} 
                            />
                        </Send>
                            :
                        <Ionicons 
                            name={'mic-circle'} 
                            color={THEME_COLORS.ICON_COLOR} 
                            size={40} 
                        />
                }
            />
            {!isTyping && 
            <View style={[style.innerContainer]}>
                <Entypo 
                    name={'image'} 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    style={style.clipIcon}
                    onPress={() => onImagePick("library")}
                />
                <SimpleLineIcons 
                    name={'camera'} 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    style={style.actionIcon}
                    onPress={() => onImagePick("camera")}
                />
                <SimpleLineIcons 
                    name={'paper-clip'} 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    style={style.actionIcon}
                    onPress={() => onDocumentPick()}
                />
            </View>}
            
        </View>
    )
}

export default CustomToolbar


