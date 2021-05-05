import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Header, Input, Image } from "react-native-elements";
import { StatusBar } from 'expo-status-bar';
import * as VideoExtensions from 'video-extensions';
import { Ionicons } from "react-native-vector-icons";
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

const styles = StyleSheet.create({
    imagePicker: { 
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center', 
        justifyContent: 'center' 
    }
})

const CreateGroupForm = ({ navigation }) => {
    const [image, setImage] = useState({ uri: '' });
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
        navigation.navigate('Search', { 
            groupName: groupName, 
            photo: image.hasOwnProperty('name') ? image : '', 
            searchType: "create" })
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
            <StatusBar style="light" backgroundColor={THEME_COLORS.STATUS_BAR}/>
            <Header
                placement="center"
                backgroundColor={THEME_COLORS.HEADER}
                leftComponent={
                    <Ionicons 
                    name="arrow-back-sharp" 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR}
                    onPress={() => navigation.navigate('Main')}
                />}
                centerComponent={{
                    text: "Create Group",
                    style: { color: THEME_COLORS.ICON_COLOR, fontSize: 20, fontWeight: "bold" },
                }}
                rightComponent={
                    <Ionicons 
                    name="checkmark-sharp" 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    onPress={() => handleFormSubmit()}
                />}
            />
            <View style={styles.imagePicker}>
                {image && (
                <Image
                    source={{ uri: image.uri ? image.uri : EMPTY_IMAGE_DIRECTORY }}
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