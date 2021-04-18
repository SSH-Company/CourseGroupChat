import React, { useState, useEffect } from 'react';
import { View, ScrollView , Button} from "react-native";
import { Header,  } from "react-native-elements";
import { Ionicons } from "react-native-vector-icons";
import { navigationRef } from '../Util/RootNavigation';
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const FriendRequests = ({ navigation }) => {
    const [list, setList] = useState<listtype[]>([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/profile/freind-request`)
            .then(res => setList(res.data.map(row => ({ 
                ...row, 
                avatar_url: row.avatar_url ? `${BASE_URL + row.avatar_url}` : EMPTY_IMAGE_DIRECTORY,
                content: 
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 150 }}>
                        <Button title="Accept" color="green" onPress={() => {}}/>
                        <Button title="Cancel" color="red" onPress={() => {}}/>
                    </View>
            }))))
            .catch(err => console.error(err))
    }, [])

    return (
        <View>
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent={
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Ionicons 
                            name="arrow-back-sharp" 
                            size={30} 
                            color="#734f96" 
                            onPress={() => navigationRef.current.goBack()}
                        />
                    </View>
                }
                centerComponent={{
                    text: "Friend Requests",
                    style: { fontWeight: "bold", color: "white", fontSize: 25 }
                }}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
                <BaseList
                    items={list}
                />
            </ScrollView>
        </View>
    )

}

export default FriendRequests
