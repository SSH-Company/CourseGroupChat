import React from 'react';
import { Dimensions, View, Image } from 'react-native';
import { Header } from "react-native-elements";
import { Ionicons } from "react-native-vector-icons";

const FullScreenMedia = ({ route, navigation }) => {
    const imgSource = route.params;
    const dimensions = Dimensions.get('screen');

    return (
        <>
        <Header
            placement="left"
            backgroundColor="black"
            leftComponent={
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
                    <Ionicons 
                        name="arrow-back-sharp" 
                        size={30} 
                        color="white" 
                        onPress={() => navigation.goBack()}
                    />
                </View>
            }
        />
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'black' }}>
            <Image
                source={{ uri: imgSource }}
                style={{ width: dimensions.width, height: dimensions.height / 3 }}
            />
        </View>
        </>
    )
}

export default FullScreenMedia