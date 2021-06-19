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
import { BASE_URL } from "../BaseUrl";
import axios from 'axios';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
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

type FormErrors = {
    email: boolean,
    password: boolean,
    firstName: boolean,
    lastName: boolean
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

const defaultErrors: FormErrors = {
    email: false,
    password: false,
    firstName: false,
    lastName: false
}

const Auth = (props: AuthProps) => {
    const {
        pageType,
        handleSubmit,
        handlePageTypeSwitch
    } = props;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errors, setErros] = useState<FormErrors>(defaultErrors);
    const [forgotPassword, setForgotPassword] = useState(false);

    const submitForm = () => {
        //check if form contains any errors
        let hasErros = false;
        let formErros: FormErrors = defaultErrors;
        Object.keys(form).forEach(key => {
            //skip firstName, lastName if form type === login
            if (pageType === "login" && ['firstName', 'lastName'].includes(key)) return;
            
            if (key === 'email') {
                formErros[key] = !form[key].endsWith('mail.utoronto.ca')
                if (formErros[key]) hasErros = true;
                return;
            }
            
            formErros[key] = form[key] === "";    
            if (formErros[key]) hasErros = true;
        })
        
        setErros({...formErros});
        if (!hasErros) handleSubmit(form);
    }

    const errorMsg = (err: string) => {
        return ( <Text style={{ color: 'red', fontSize: 15 }}>{err}</Text> )
    }

    const handleForgotPassword = () => {
        axios.post(`${BASE_URL}/api/auth/generate-reset-link`, { email: form.email })
            .then(() => {
                setForgotPassword(false) 
            })
            .catch(err => {
                console.error(err)
            })
    }

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../../assets/website.png')} style={styles.background}>
                {forgotPassword ?
                    <SafeAreaView>
                        <Text style={styles.title}>{"Enter your email"}</Text>
                        <TextInput 
                            placeholder="Email..."
                            style={styles.input}
                            value={form.email} 
                            onChangeText={text => setForm({ ...form, email: text })}
                        />
                        <Button
                            title='Submit'
                            onPress={handleForgotPassword}
                        /> 
                    </SafeAreaView>
                    :
                    <>
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
                                    {errors.firstName && errorMsg('First name cannot be empty.')}
                                    <TextInput 
                                        placeholder="Last Name"
                                        style={styles.input}
                                        value={form.lastName} 
                                        onChangeText={text => setForm({ ...form, lastName: text })}
                                    />
                                    {errors.lastName && errorMsg('Last name cannot be empty.')}
                                </>
                            }
                            <TextInput 
                                placeholder="Enter your email"
                                style={styles.input}
                                value={form.email} 
                                onChangeText={text => setForm({ ...form, email: text })}
                            />
                            {errors.email && errorMsg('Please enter a valid Uoft email address.')}
                            <TextInput 
                                placeholder="Enter your password"
                                style={styles.input}
                                value={form.password}
                                secureTextEntry
                                onChangeText={text => setForm({ ...form, password: text })}
                            />
                            {errors.password && errorMsg('Password cannot be empty.')}
                            <Button
                                title='Submit'
                                onPress={submitForm}
                            />  
                            <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 20, textDecorationLine: 'underline' }} onPress={handlePageTypeSwitch}>
                                {pageType === "login" ?
                                    'New to Cirkle? Click here to signup!'
                                    :
                                    'Already a member? Click here to login!'
                                }
                                {"\n"}
                            </Text>
                            <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 20, textDecorationLine: 'underline', color: 'blue' }} onPress={() => setForgotPassword(true)}>
                                Forgot Password?
                            </Text>
                        </SafeAreaView>
                            </>
                        }
                    </ImageBackground>
                </SafeAreaView>
            )
}

export default Auth



