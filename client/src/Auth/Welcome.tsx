import React, {useState} from 'react';
import { View, 
        Text, 
        Dimensions, 
        StyleSheet, 
        Platform,
        ImageBackground
    } from 'react-native';
import { Button } from 'react-native-elements';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { listtype } from '../Util/CommonComponents/BaseList';
import { color } from 'react-native-reanimated';

const Welcome = () => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;
    const backgroundImg = '../../assets/website.png';
    
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState<ItemType[]>([
        {label: 'University of Toronto', value: 'university of toronto'}
    ]);

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
        button: {
            marginTop: windowHeight * 0.08,
            marginLeft: windowWidth * 0.15,
            maxWidth: windowWidth * 0.7,
            borderRadius: 14,
            borderWidth: 2,
            overflow: 'hidden',
            color: 'white',
            backgroundColor: 'white'
        }
    });

    return (
        <View style={styles.container}>
            <ImageBackground source={require(backgroundImg)} style={styles.background}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.subtitle}>Sign in to continue!</Text>
                <DropDownPicker
                    open={open}
                    value={null}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    placeholder='Select your university'
                    textStyle={{textAlign: 'center'}}
                    style={styles.dropdown}
                />
                <Button
                    title='NEXT'
                    style={styles.button}
                    color
                    
                />
            </ImageBackground>
        </View>

    )
}

export default Welcome;