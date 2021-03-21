import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView, Platform } from "react-native";
import { ListItem, Avatar, SearchBar, Header } from "react-native-elements";
import VerifiedIcon from '../Util/VerifiedIcon';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';
import { Ionicons } from "react-native-vector-icons";

type listtype = {
    id: number;
    name: string;
    avatar_url: string;
    verified: 'Y' | 'N';
}

const GroupSearch = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifiedList, setVerifiedList] = useState<listtype[]>([]);
    const searchRef = useRef(null);

    useEffect(() => {
        searchRef.current.focus();
        getVerifiedList()
    }, [])

    const getVerifiedList = () => {
        axios.get(`${BASE_URL}/api/group/all-groups`)
            .then(res => {
                setVerifiedList(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err))
    }

    const filteredList = useMemo<listtype[]>(() => {
        return verifiedList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
    }, [verifiedList, search])

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
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >
                <SearchBar
                    ref={searchRef}
                    platform={Platform.OS === "android" ? "android" : "ios"}
                    clearIcon={{ size: 30 }}
                    placeholder="Search for groups"
                    onChangeText={(text) => setSearch(text)}
                    onCancel={() => setSearch("")}
                    value={search}
                />
                {loading ?
                    <ActivityIndicator />
                    :
                    filteredList.map((l, i) => (
                        <ListItem
                          key={i}
                          onPress={() => {
                            navigation.navigate("Chat", {
                              groupID: { 
                                id: l.id, 
                                name: l.name, 
                                avatar: l.avatar_url, 
                                verified: l.verified
                              }
                            })
                          }}
                        >
                          <Avatar rounded size="medium" source={{ uri: `${BASE_URL}${l.avatar_url}` }}/>
                          <ListItem.Content>
                            <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                              <ListItem.Title>{`${l.name}`}</ListItem.Title>
                              {l.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
                            </View>
                          </ListItem.Content>
                        </ListItem>
                      ))
                }
            </ScrollView>
        </View>
    )
    
}

export default GroupSearch