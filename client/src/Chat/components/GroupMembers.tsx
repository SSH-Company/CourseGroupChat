import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, Platform, StyleSheet } from "react-native";
import { ListItem, Avatar, Header, SearchBar, Button } from "react-native-elements";
import { navigationRef } from '../../Util/RootNavigation';
import { Ionicons } from "react-native-vector-icons";
import BaseList from '../../Util/CommonComponents/BaseList';
import BASE_URL from '../../../BaseUrl';
import axios from 'axios';

type listtype = {
    id: string;
    name: string;
    avatar_url: string;
    checked: boolean;
}

const GroupMembers = ({ route, navigation }) => {

    const { id, name } = route.params;
    const [members, setMembers] = useState<listtype[]>([]);

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
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
                    text: "Members",
                    style: { fontWeight: "bold", color: "white", fontSize: 25 }
                }}
                rightComponent={
                    <View>
                        <Button 
                            title="Add"
                            style={{ backgroundColor: '#734f96',  }} 
                            onPress={() => navigation.navigate('Search', { groupName: name, groupID: id, searchType: "add" })} />
                    </View>
                }
            />



        </View>
    )

}

export default GroupMembers