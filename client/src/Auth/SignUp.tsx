import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements'
import { Colors } from 'react-native/Libraries/NewAppScreen';

export type reglisttype = {
    firstname: string;
    surname: string;
    dob: string;
    email: string;
    tnc: boolean;
    submitenable: boolean;
    
    firstnameError: boolean;
    display_nameError: boolean;
    surnameError: boolean;
    display_surnameError: boolean;
    dobError: boolean;
    display_dobError: boolean;
    emailError: boolean;
    display_emailError: boolean;
};

const SignUp = () => {

    const styles = StyleSheet.create({
        input: {
          width: 350,
          height: 55,
          backgroundColor: '#734f96',
          margin: 10,
          padding: 8,
          color: 'white',
          borderRadius: 14,
          fontSize: 18,
          fontWeight: '500',
        },
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }
      })

    const handleNavigationStateChange = (state) => {
        // console.log(state);
    }

    const handleMessage = (msg: string) => {
        try {
            const userData = JSON.parse(msg);
            console.log(userData);
        } catch (err) {
            console.log(err);
            return
        }
    }

    // list of fields necessary.
    

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder='First Name'
                autoCapitalize="none"
                placeholderTextColor='white'
                // onChangeText={onChangeText('phone_number', val)}
            />
            <TextInput
                style={styles.input}
                placeholder='Last Name'
                autoCapitalize="none"
                placeholderTextColor='white'
            />
            <TextInput
                style={styles.input}
                placeholder='DOB (mm/dd/yy)'
                secureTextEntry={true}
                autoCapitalize="none"
                placeholderTextColor='white'
            />
            <TextInput
                style={styles.input}
                placeholder='Email'
                autoCapitalize="none"
                placeholderTextColor='white'
            />
            <TextInput
                style={styles.input}
                placeholder='Phone Number'
                autoCapitalize="none"
                placeholderTextColor='white'
            />
            <Button
                title='Sign Up'
                style={{
                    backgroundColor: '#734f96',
                    borderColor: '#734f96'
                }}
                
                // onPress={signUp}
            />
        </View>
    )
}

export default SignUp
