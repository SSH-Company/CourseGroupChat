import React, { useState, useEffect, useContext } from 'react';
import { View, Image, Dimensions, Alert } from 'react-native';
import { Header, Input, Button } from 'react-native-elements';
import LightBox from 'react-native-lightbox';
import { AntDesign, MaterialIcons } from "react-native-vector-icons";
import { handleImagePick, handlePermissionRequest, IMAGE_EXTENSIONS } from "../../Util/ImagePicker";
import { UserContext } from '../../Auth/Login';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleError } from '../../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const EditProfile = ({ navigation }) => {

    const { user, setUser } = useContext(UserContext);
    const [lightboxOpened, setLightboxopened] = useState(false);
    const dimensions = Dimensions.get('window');

    const sendData = (image: any) => {
        const formData = new FormData();
        formData.append('avatar', {...image})

        axios.post(`${BASE_URL}/api/profile/upload-profile-pic`, formData, { headers: { 'content-type': 'multipart/form-data' } })
            .then(res => {
                const newAvatar = res.data.path;
                setUser({
                    ...user,
                    avatar: newAvatar || user.avatar as string
                });
                return;
            })
            .catch(err => {
                handleError(err);
            })
    }

    // functionalities.
    const uploadImage = async () => {
        try {
            const status = await handlePermissionRequest("library");
            if (status === "granted") {
                const imageRes = await handleImagePick("library");
                if (imageRes) {
                    const fileExtension = imageRes.type.split('/')[1];
                    if (!IMAGE_EXTENSIONS.includes(fileExtension)) {
                        Alert.alert(
                            `Failed to upload file`,
                            `The file format '.${fileExtension}' is not supported as a profile picture.`,
                            [{ text: "OK", style: "cancel" }]
                        )
                        return;
                    }
                    sendData(imageRes);
                } 
            }
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={"white"}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={
                    <AntDesign 
                        name="left" 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        onPress={() => navigation.goBack()}
                    />
                }
            />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <LightBox activeProps={{ resizeMode: 'contain', flex: 1, height: dimensions.height }} onOpen={() => setLightboxopened(true)} onClose={() => setLightboxopened(false)}>
                    <Image
                        source={{ uri: user.avatar as string || EMPTY_IMAGE_DIRECTORY }}
                        style={lightboxOpened ? { height: dimensions.height, width: dimensions.width, resizeMode: 'contain' } : 
                            { width: 175, height: 175, borderRadius: 200, marginBottom: -45 }}
                    />
                </LightBox>
                <Button 
                    icon={
                        <MaterialIcons 
                            name="edit" 
                            size={30}
                            color={'white'} 
                            onPress={uploadImage}
                        />
                    }
                    buttonStyle={{ backgroundColor: '#4c7972', borderRadius: 50, marginLeft: 120 }}
                />
            </View>
            <View style={{ paddingTop: 50 }}>
                <Input
                    disabled
                    label="University provided name"
                    value={user.name}
                    inputStyle={{ fontWeight: 'bold', color: 'black' }}
                />
                <Input
                    disabled
                    label="University E-mail"
                    value={user.email}
                    inputStyle={{ fontWeight: 'bold', color: 'black' }}
                />
            </View>
        </View>
    )
}

export default EditProfile