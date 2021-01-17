import React, { FunctionComponent } from 'react'
import { View, StyleSheet } from 'react-native'
import { InputToolbar, Send } from 'react-native-gifted-chat'
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const style = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        backgroundColor: 'white',
        maxWidth: '100%',
        borderRadius: 30
    },
    //input toolbar
    inputbar: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 30,
        marginLeft: 10,
        maxWidth: '94%'
    },
    //button icons
    uploadIcon: {
        marginLeft: 10,
        marginRight: 12,
        alignSelf: 'center',
    },
    micIcon: {
        justifyContent: 'flex-end',
        marginLeft: 380
    }
})

const CustomToolbar:FunctionComponent = (props) => {
    return (
        <View style={[style.container]}>
            <InputToolbar 
            {...props} 
            containerStyle={style.inputbar} 
            renderActions={() => {
                return (
                    <AntDesign name={'pluscircle'} color='#734f96' size={20} style={style.uploadIcon}/>
                )}}
            renderSend={() => {
                return (
                    <Send {...props} containerStyle={{alignSelf: 'center', paddingBottom: 12}}>
                        <Ionicons name={'send'} color='#734f96' size={20} />
                    </Send>
                )
            }}
            />
            <FontAwesome name={'microphone'} color='#734f96' size={20} style={style.micIcon}/>
        </View>
    )
}

export default CustomToolbar