import React, { useState } from 'react';
import { 
    View, 
    Text, 
    Dimensions, 
    StyleSheet, 
    ImageBackground,
    TextInput,
    SafeAreaView
} from 'react-native';
import { Button } from 'react-native-elements';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    background: {
        flex: 1,
        resizeMode: 'stretch',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        alignSelf: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 10,
        marginBottom: 10,
        padding: 10
    }
})

export type FormData = {
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
}

type AuthProps = {
    pageType: "login" | "signup",
    handleSubmit: (form: FormData) => any,
    handlePageTypeSwitch: () => any
}

const emptyForm: FormData = {
    email: '',
    password: '',
    firstName: '',
    lastName: ''
}

const Auth = (props: AuthProps) => {
    const {
        pageType,
        handleSubmit,
        handlePageTypeSwitch
    } = props;

    const [form, setForm] = useState<FormData>(emptyForm);

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../../assets/website.png')} style={styles.background}>
                <Text style={styles.title}>{pageType === "login" ? "Login" : "Sign Up"}</Text>
                <SafeAreaView style={{ paddingTop: 10 }}>
                    {pageType === "signup" &&
                        <>
                            <TextInput 
                                placeholder="First Name"
                                style={styles.input}
                                value={form.firstName} 
                                onChangeText={text => setForm({ ...form, firstName: text })}
                            />
                            <TextInput 
                                placeholder="Last Name"
                                style={styles.input}
                                value={form.lastName} 
                                onChangeText={text => setForm({ ...form, lastName: text })}
                            />
                        </>
                    }
                    <TextInput 
                        placeholder="Enter your email"
                        style={styles.input}
                        value={form.email} 
                        onChangeText={text => setForm({ ...form, email: text })}
                    />
                    <TextInput 
                        placeholder="Enter your password"
                        style={styles.input}
                        value={form.password}
                        secureTextEntry
                        onChangeText={text => setForm({ ...form, password: text })}
                    />
                    <Button
                        title='Submit'
                        onPress={() => handleSubmit(form)}
                    />
                    <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 20, textDecorationLine: 'underline' }} onPress={handlePageTypeSwitch}>
                        {pageType === "login" ?
                            'New to Cirkle? Click here to signup!'
                            :
                            'Already a member? Click here to login!'
                        }
                    </Text>
                </SafeAreaView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default Auth