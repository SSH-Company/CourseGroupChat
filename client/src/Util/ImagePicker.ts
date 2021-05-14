import * as ImagePicker from 'expo-image-picker';

type MediaType = "library" | "camera"

export const handlePermissionRequest = async (type: MediaType) => {
    let status;
    
    switch (type) {
        case "camera":
            status = await ImagePicker.requestCameraPermissionsAsync();
            break;
        case "library":
            status = await ImagePicker.requestMediaLibraryPermissionsAsync();
            break;
        default:
            break;
    }

    if (status.status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
    }
    return status.status
}

export const handleImagePick = async (type: MediaType) => {
    let result: any;
    
    switch (type) {
        case "camera":
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All
            });
            break;
        case "library":
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                quality: 1,
            });
            break;
        default:
            break;
    }

    if (!result.cancelled) {
        const filename = result.uri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let fileType = match ? `image/${match[1]}` : `image`;
    
        return {
            uri: result.uri,
            name: filename,
            type: fileType
        };
    }
};

