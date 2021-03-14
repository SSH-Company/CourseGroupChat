import React, { useState, useEffect } from "react";
import { View, Image, Button, StyleSheet } from "react-native";
import { Header, Input } from "react-native-elements";
import { Ionicons } from "react-native-vector-icons";
import { handleImagePick, handlePermissionRequest } from "../Util/ImagePicker";

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

    const handleFormSubmit = () => {
        if (!groupName) {
            setErrorMessage('Group name is required');
            return
        }

        //clear error message
        setErrorMessage('');
        navigation.navigate('Search', { groupName: groupName, photo: image })
    }

    const onImagePick = async () => {
        try {
            const status = await handlePermissionRequest();
            if (status === "granted") {
                const imageRes = await handleImagePick();
                setImage(imageRes);
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
                />
                )}
                <Button title="Choose Photo" onPress={onImagePick} />
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