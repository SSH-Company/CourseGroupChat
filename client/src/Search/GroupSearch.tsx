import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView, Platform } from "react-native";
import { SearchBar, Header } from "react-native-elements";
import { AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
import { handleError } from '../Util/CommonFunctions';
axios.defaults.headers = { withCredentials: true };

const GroupSearch = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifiedList, setVerifiedList] = useState<listtype[]>([]);
    const [userList, setUserList] = useState<listtype[]>([]);
    const searchRef = useRef(null);

    useEffect(() => {
        searchRef.current.focus();
        Promise.all([axios.get(`${BASE_URL}/api/search/all-groups`), axios.get(`${BASE_URL}/api/search/users`)])
            .then(res => {
                setVerifiedList(res[0].data);
                setUserList(res[1].data)
                setLoading(false);
            })
            .catch(err => handleError(err))
    }, []);

    const filteredList = useMemo<listtype[]>(() => {
        const filteredVerifiedList = verifiedList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
        const filteredUserList = userList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
        return filteredVerifiedList.concat(filteredUserList).sort();
    }, [verifiedList, userList, search])

    const onItemPress = (item: listtype) => {
        navigation.navigate("Chat", { groupID: item.id, name: item.name, avatar: item.avatar_url, verified: item.verified })
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="center"
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={
                  <AntDesign 
                    name="left" 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    onPress={() => navigation.navigate('Main')}
                />}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >
                <SearchBar
                    ref={searchRef}
                    platform={"android"}
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
                        <BaseList
                            title="Users"
                            items={userList}
                            itemOnPress={l => navigation.navigate('Profile', { id: l.id })}
                            onAvatarClick={id => navigation.navigate('Profile', { id })}
                        />
                      </>
                      :
                      <BaseList 
                          items={filteredList}
                          itemOnPress={l => {
                            if (l.hasOwnProperty('verified')) onItemPress(l)
                            else navigation.navigate("Profile", { id: l.id });
                          }}
                      />
                    )
                }
            </ScrollView>
        </View>
    )
}

export default GroupSearch