import * as ImagePicker from 'expo-image-picker';

export const handlePermissionRequest = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
    }
    return status
}

export const handleImagePick = async () => {
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

        return {
            uri: result.uri,
            name: filename,
            type: type
        };
    }
};
