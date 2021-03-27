import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Header, Input, Image } from "react-native-elements";
import * as VideoExtensions from 'video-extensions';
import { Ionicons } from "react-native-vector-icons";
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import BASE_URL from '../../BaseUrl';

const styles = StyleSheet.create({
    imagePicker: { 
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center', 
        justifyContent: 'center' 
    }
})

const CreateGroupForm = ({ navigation }) => {
    const [image, setImage] = useState({ uri: `${BASE_URL}/media/empty_profile_pic.jpg` });
    const [groupName, setGroupName] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [invalidImage, setInvalidImage] = useState(false);

    const handleFormSubmit = () => {
        if (!groupName) {
            setErrorMessage('Group name is required');
            return
        }

        //clear error message
        setErrorMessage('');
        navigation.navigate('Search', { groupName: groupName, photo: image, searchType: "create" })
    }

    const onImagePick = async () => {
        try {
            setInvalidImage(false);
            const status = await handlePermissionRequest("library");
            if (status === "granted") {
                const imageRes = await handleImagePick("library");
                if (imageRes) {
                    const fileExtension = imageRes.type.split('/')[1];
                    const mediaType = (VideoExtensions as any).default.includes(fileExtension) ? "video" : "image";
                    if (mediaType === "video") {
                        setInvalidImage(true);
                        return;
                    }
                    setImage(imageRes);
                } 
            }
        } catch (err) {
            console.log(err);
        }
    }

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
                    onPress={onImagePick}
                />
                )}
                {invalidImage && <Text style={{ color: 'red' }}>The selected file type is not accepted</Text>}
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