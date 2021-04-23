import React, { useState, useEffect } from 'react';
import { 
    ActivityIndicator,
    Dimensions, 
    View, 
    ScrollView, 
    Image, 
    TouchableOpacity, 
    StyleSheet 
} from "react-native";
import { Video } from 'expo-av';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

type ListType = {
    body: string,
    type: 'image' | 'video'
}

// const styles = StyleSheet.create({
//     video: {
//         minWidth: 200,
//         minHeight: 200,
//         alignSelf: 'center'
//     }
// })

const Gallery = ({ route, navigation }) => {
    const grpId = route.params;
    const [list, setList] = useState<ListType[]>([]);
    const [loading, setLoading] = useState<boolean>();
    const dimensions = Dimensions.get('screen');

    useEffect(() => {
        setLoading(true);
        axios.get(`${BASE_URL}/api/chat/gallery/${grpId}`)
            .then(res => {
                console.log(res.data);
                setList(res.data);
                setLoading(false); 
            })
            .catch(err => {
                console.log(err);
                return;
            });
    }, [grpId])

    const getRenderedItem = (item: ListType) => {
        switch(item.type) {
            case 'image':
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('FullScreenMedia', item.body)}
                    >       
                        <Image
                            source={{ uri: item.body || EMPTY_IMAGE_DIRECTORY }}
                            style={{ width: dimensions.width, height: 200, marginBottom: 10, borderRadius: 20 }}
                        />
                    </TouchableOpacity>
                )
            case 'video':
                return (
                    <View>
                        <Video
                            style={{ minWidth: dimensions.width }}
                            source={{ uri: item.body }}
                            useNativeControls
                            resizeMode="cover"
                            isLooping
                        />
                    </View>
                )
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator />
            </View>
        )
    } else {
        return (
            <ScrollView keyboardShouldPersistTaps="handled">
                {list.map(row => getRenderedItem(row))}
            </ScrollView>
        )
    }
}

export default Gallery