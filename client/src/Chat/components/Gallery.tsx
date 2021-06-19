import React, { useState, useEffect } from 'react';
import { 
    ActivityIndicator,
    Dimensions, 
    View, 
    ScrollView, 
    Image
} from "react-native";
import LightBox from 'react-native-lightbox';
import { Video } from 'expo-av';
import { handleError } from '../../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';


type ListType = {
    body: string,
    type: 'image' | 'video'
}

const Gallery = ({ route, navigation }) => {
    const grpId = route.params;
    const [list, setList] = useState<ListType[]>([]);
    const [loading, setLoading] = useState<boolean>();
    const dimensions = Dimensions.get('screen');

    useEffect(() => {
        setLoading(true);
        axios.get(`${BASE_URL}/api/chat/gallery/${grpId}`)
            .then(res => {
                setList(res.data);
                setLoading(false); 
            })
            .catch(err => {
                handleError(err);
                return;
            });
    }, [grpId])

    const getRenderedItem = (item: ListType) => {
        switch(item.type) {
            case 'image':
                return (
                    <LightBox>       
                        <Image
                            source={{ uri: item.body || EMPTY_IMAGE_DIRECTORY }}
                            style={{ width: dimensions.width, height: 200, marginTop: 10 }}
                        />
                    </LightBox>
                )
            case 'video':
                return (
                    <Video
                        style={{ minWidth: dimensions.width, minHeight: 200, alignSelf: 'center' }}
                        source={{ uri: item.body }}
                        useNativeControls
                        resizeMode="cover"
                        isLooping
                    />
                )
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator color="blue"/>
            </View>
        )
    } else {
        return (
            <ScrollView keyboardShouldPersistTaps="handled">
                {list.map(row => (
                    <View style={{ paddingBottom: 10 }} key={`${row.type}-${row.body}`}>
                        {getRenderedItem(row)}
                    </View>
                ))}
            </ScrollView>
        )
    }
}

export default Gallery