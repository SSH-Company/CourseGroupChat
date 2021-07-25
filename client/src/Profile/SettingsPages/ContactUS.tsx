import React, { useState, Component } from 'react';
import { 
    View, 
    Text, 
    Dimensions, 
    StyleSheet, 
    ImageBackground,
    TextInput,
    Alert
} from 'react-native';
import { Button, Header } from 'react-native-elements';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { AntDesign } from "react-native-vector-icons";
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const backgroundImg = '../../assets/website.png';
const deviceDimensions = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    input: {
        borderWidth: 2,
        borderColor: 'black',
        minWidth: windowWidth*.75,
        textAlignVertical: 'top',
        height: 150,
        width: '80%',
        fontSize: deviceDimensions.fontScale*14,
        margin:20,
        padding: 20
    }
});



const ContactUs = ({navigation}) => {

    const sendMessage = (text: string) => {
        axios.post(`${BASE_URL}/api/profile/contact-us`, { message: value })
        // .then((response) => {
        //     console.log(response);
        //   }, (error) => {
        //     console.log(error);
        //   });
        console.log(value)
        return(Alert.alert('Message Received', "Thank you for contacting us. We will follow up with you soon."))
    }

    const [value, setValue] = useState('');

    return (
        <View style={styles.container}>
            <Header
                    placement="left"
                    backgroundColor={THEME_COLORS.HEADER}
                    statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                    leftComponent={
                        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                            <AntDesign 
                                name="left" 
                                size={25} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.goBack()}
                            />
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: deviceDimensions.fontScale*20, paddingLeft: 10 }}>Contact Us</Text>
                        </View>
                    }
            />
            <TextInput
                placeholder="Describe Your Problem"
                style= {styles.input}
                multiline={true}
                value={value} 
                onChangeText={text => setValue(text)}
            />       

            <Button style = {{alignSelf: 'baseline'}}
                title='SEND'
                onPress={() => {value === ''? Alert.alert('No message detected','Please describe your problem first.'): (sendMessage(value), navigation.goBack())}}
            /> 

                
        </View>

    )}

export default ContactUs