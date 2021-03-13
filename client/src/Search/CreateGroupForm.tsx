import React, { useState, useEffect } from "react";
import { View, Image, Button, StyleSheet } from "react-native";
import { Header, Input } from "react-native-elements";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "react-native-vector-icons";

const styles = StyleSheet.create({
    imagePicker: { 
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center', 
        justifyContent: 'center' 
    }
})

const CreateGroupForm = ({ navigation }) => {
    const [image, setImage] = useState(null);
    const [groupName, setGroupName] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        handlePermissionRequest()
    }, []);

    const handlePermissionRequest = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
        return
    }

    const handleFormSubmit = () => {
        if (!groupName) {
            setErrorMessage('Group name is required');
            return
        }

        //clear error message
        setErrorMessage('');
        navigation.navigate('Search', { groupName: groupName, photo: image })
    }

    const handleImagePick = async () => {
        let result: any = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.cancelled) {
            const filename = result.uri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            setImage({
                uri: result.uri,
                name: filename,
                type: type
            });
        }
      };

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent={
                    <Ionicons 
                    name="arrow-back-sharp" 
                    size={25} 
                    color="#734f96" 
                    onPress={() => navigation.navigate('Main')}
                />}
                centerComponent={{
                    text: "Create Group",
                    style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
                }}
                rightComponent={
                    <Ionicons 
                    name="checkmark-sharp" 
                    size={25} 
                    color="#734f96" 
                    onPress={() => handleFormSubmit()}
                />}
            />
            <View style={styles.imagePicker}>
                {image && (
                <Image
                    source={{ uri: image.uri }}
                    style={{ width: 400, height: 400, marginBottom: 10 }}
                />
                )}
                <Button title="Choose Photo" onPress={handleImagePick} />
            </View>
            <Input 
                placeholder="Group name (Required)"
                onChangeText={value => setGroupName(value)}
                errorStyle={{ color: 'red' }}
                errorMessage={errorMessage}
            />
        </View>
    )
}

export default CreateGroupForm;