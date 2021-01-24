import React from 'react'
import { Dimensions, View, StyleSheet } from 'react-native';
import { ListItem, Image, Text} from 'react-native-elements';
import { AntDesign, Entypo, Ionicons, MaterialIcons } from 'react-native-vector-icons'

const Settings = ( {navigation} ) => {
    const deviceDimensions = Dimensions.get('window')

    const styles = StyleSheet.create({
        imageContainer: {
            width: deviceDimensions.width,
            justifyContent: 'center',
            alignItems: 'center'
        },
        imageStyle: {
            width: 100,
            height: 100,
            marginTop: 50,
            marginBottom: 25,
            borderRadius: 200
        }
    })

    // settingsList props.
    const iconSize = 20;

    // image props.
    const imageProps = {
        source: 'https://placeimg.com/140/140/any',
        name: 'Sultan\'s Dine'
    }

    const settingsList = [
        // Daily use.
        {
            title: 'Active Status',
            icon: <Entypo name={"sound-mute"} size={iconSize}/>
        },
        {
            title: 'Dark Mode',
            icon: <MaterialIcons name={"groups"} size={iconSize}/>
        },
        // Preferences.
        {
            title: 'Notifications',
            icon: <AntDesign name={"picture"} size={iconSize}/>
        },
        {
            title: 'Photos & Media',
            icon: <Entypo name={"calendar"} size={iconSize}/>
        },
        // Account.
        {
            title: 'Personal Information',
            icon: <Entypo name={"magnifying-glass"} size={iconSize}/>
        },
        {
            title: 'Privacy Settings',
            icon: <MaterialIcons name={"how-to-vote"} size={iconSize}/>
        },
        {
            title: 'Security & Login',
            icon: <Ionicons name={"heart"} size={iconSize}/>
        },
        {
            title: 'Blocking',
            icon: <Ionicons name={"settings-outline"} size={iconSize}/>
        }
    ]

    return (
        <View>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageProps.source }}
                    style={ styles.imageStyle }
                />
                <Text style={{ paddingBottom: 10, fontSize: 25 }}>{imageProps.name}</Text>
            </View>
            {settingsList.map((item, i) => (
                <ListItem key={i}>
                    {item.icon}
                    <ListItem.Content>
                        <ListItem.Title>{item.title}</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            ))}
        </View>
    );
};

export default Settings;