import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView, Platform } from "react-native";
import { SearchBar, Header } from "react-native-elements";
import { Ionicons } from "react-native-vector-icons";
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

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
        axios.get(`${BASE_URL}/api/search/all-groups`)
            .then(res => {
                setVerifiedList(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err))
    }

    const filteredList = useMemo<listtype[]>(() => {
        return verifiedList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
    }, [verifiedList, search])

    const onItemPress = (item: listtype) => {
        navigation.navigate("Chat", { groupID: item.id, name: item.name, avatar: item.avatar_url, verified: item.verified })
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
                    onCancel={() => searchRef.current.clear()}
                    value={search}
                    showCancel={false}
                />
                {loading ?
                    <ActivityIndicator />
                    :
                    (search.length === 0 ?
                      <>
                        <BaseList 
                            title="Recent Chats"
                            items={verifiedList.filter(row => row.verified === 'N').slice(0, 5)}
                            itemOnPress={l => onItemPress(l)}
                        />
                        <BaseList
                            title="Verified groups"
                            items={verifiedList.filter(row => row.verified === 'Y').slice(0, 10)}
                            itemOnPress={l => onItemPress(l)}
                        />
                      </>
                      :
                      <BaseList 
                          items={filteredList}
                          itemOnPress={l => onItemPress(l)}
                      />
                    )
                }
            </ScrollView>
        </View>
    )
    
}

export default GroupSearch