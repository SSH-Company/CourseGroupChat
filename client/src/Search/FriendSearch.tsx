import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView, Platform } from "react-native";
import { SearchBar, Header, Button } from "react-native-elements";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const FriendSearch = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [friendList, setFriendList] = useState<listtype[]>([]);
    const searchRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        searchRef.current.focus();
        axios.get(`${BASE_URL}/api/search/friend-search`)
            .then(res => {
                if (mounted) {
                    const users = res.data;
                    if (users?.length > 0) {
                        setFriendList(users.map((row, index) => {
                            let subtitle = null, content = <Ionicons name="person-add-outline" size={25} onPress={() => sendFriendRequest(row.id, index)}/>;
                            switch (row.friendStatus) {
                                case 'ACCEPTED':
                                    subtitle = 'You are already friends',
                                    content = <Ionicons name="checkmark" size={35} color="green"/>
                                    break;
                                case 'PENDING':
                                    subtitle = 'Request status is pending',
                                    content = <MaterialIcons name="pending" size={35} color="blue"/>
                                    break;
                                default:
                                    break;
                            }
                            const temp = {
                                ...row,
                                subtitle: subtitle,
                                content: content
                            }
                            return temp
                        }));
                        setLoading(false);
                    }
                }
            })
            .catch(err => console.error(err))

        return () => { mounted = false; }
    }, []);

    const filteredList = useMemo<listtype[]>(() => {
        const filteredFriendList = friendList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
        return filteredFriendList.sort();
    }, [friendList, search])

    const sendFriendRequest = (id: string, index: number) => { 
        let mounted = true;
        axios.post(`${BASE_URL}/api/profile/friend-request`, { id: id })
            .then(res => {
                if (mounted) {
                    setFriendList(prevList => {
                        const list = [...prevList];
                        list[index] = {
                            ...list[index],
                            subtitle: 'You have sent a friend request',
                            content: <MaterialIcons name="pending" size={35} color="blue"/>
                        }
                        return list
                    });
                }
            })
            .catch(err => {
                console.log('unable to send request');
                console.error(err);
            })
        
        return () => { mounted = false; }
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                leftComponent={
                  <Ionicons 
                    name="arrow-back-sharp" 
                    size={25} 
                    color={THEME_COLORS.ICON_COLOR} 
                    onPress={() => navigation.goBack()}
                />}
                centerComponent={{
                    text: "Add Friend",
                    style: { fontWeight: "bold", color: "black", fontSize: 25 }
                }}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >
                <SearchBar
                    ref={searchRef}
                    platform={Platform.OS === "android" ? "android" : "ios"}
                    clearIcon={{ size: 30 }}
                    placeholder="Search..."
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
                            items={friendList.slice(0, 20)}
                            onAvatarClick={id => navigation.navigate('Profile', { id })}
                        />
                      </>
                      :
                      <BaseList 
                          items={filteredList}
                          onAvatarClick={id => navigation.navigate('Profile', { id })}
                      />
                    )
                }
            </ScrollView>
        </View>
    )
}

export default FriendSearch