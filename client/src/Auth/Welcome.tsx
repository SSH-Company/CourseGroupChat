import React, { useState } from 'react';
import { 
    View, 
    Text, 
    Dimensions, 
    StyleSheet, 
    ImageBackground,
    TextInput
} from 'react-native';
import { Button } from 'react-native-elements';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const backgroundImg = '../../assets/website.png';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: windowWidth * 0.14,
        textAlign: 'center',
        width: windowWidth
    },
    subtitle: {
        fontSize: windowWidth * 0.045,
        textAlign: 'center'
    },
    background: {
        flex: 1,
        resizeMode: 'stretch',
        justifyContent: 'center',
    },
    dropdown: {
        marginTop: windowHeight * 0.08,
        marginLeft: windowWidth * 0.05,
        maxWidth: windowWidth * 0.9
    },
    input: {
        borderWidth: 1,
        borderColor: 'black',
        minWidth: 250,
        marginRight: 10
    }
});

type WelcomeProps = {
    onSubmitPress: (text: string) => any
}

const Welcome = (props: WelcomeProps) => {
    const {
        onSubmitPress = (text) => {}
    } = props;

    const [value, setValue] = useState('');

    return (
        <View style={styles.container}>
            <ImageBackground source={require(backgroundImg)} style={styles.background}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>Sign in to continue!</Text>
                {/* <DropDownPicker
                    open={open}
                    value={null}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder='Select your university'
                    textStyle={{textAlign: 'center'}}
                    style={styles.dropdown}
                /> */}
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                    <TextInput 
                        placeholder="Enter your email..."
                        style={styles.input}
                        value={value} 
                        onChangeText={text => setValue(text)}
                    />
                    <Button
                        title='NEXT'
                        onPress={() => onSubmitPress(value)}
                    />
                </View>
            </ImageBackground>
        </View>

    )
}

export default Welcome;