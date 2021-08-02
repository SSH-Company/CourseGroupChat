import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView } from "react-native";
import { SearchBar, Header } from "react-native-elements";
import { AntDesign } from "react-native-vector-icons";
import InboxSettings from "../Util/CommonComponents/InboxSettings";
import { ChatLog } from "../Util/ChatLog";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';
import { handleError } from '../Util/CommonFunctions';

const GroupSearch = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [groupList, setGroupList] = useState<listtype[]>([]);
    const [courseList, setCourseList] = useState<listtype[]>([]);
    const [userList, setUserList] = useState<listtype[]>([]);
    const [selectedItem, setSelectedItem] = useState<listtype>();
    const [renderGroupInbox, setRenderGroupInbox] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        Promise.all([axios.get(`${BASE_URL}/api/search/all-groups`), axios.get(`${BASE_URL}/api/search/users`), axios.get(`${BASE_URL}/api/search/verified-groups`)])
            .then(res => {
                setGroupList(res[0].data);
                setUserList(res[1].data);
                setCourseList(res[2].data);
                setLoading(false);
                searchRef.current.focus();
            })
            .catch(err => handleError(err))
    }, []);

    const filteredGroupList = useMemo<listtype[]>(() => {
        let list = [];
        if (groupList.length > 0) list = groupList.filter(item => item?.name?.toLowerCase()?.includes(search.toLowerCase())).slice(0, 10);
        return search.length > 0 ? list.sort() : groupList;
    }, [groupList, search]);

    const filteredCourseList = useMemo<listtype[]>(() => {
        let list = [];
        if (courseList.length > 0) list = courseList.filter(item => item?.name?.toLowerCase()?.includes(search.toLowerCase())).slice(0, 10);
        return search.length > 0 ? list.sort() : courseList;
    }, [courseList, search]);

    const filteredUserList = useMemo<listtype[]>(() => {
        let list = [];
        if (userList.length > 0) list = userList.filter(item => item?.name?.toLowerCase()?.includes(search.toLowerCase())).slice(0, 10);
        return search.length > 0 ? list.sort() : userList;
    }, [userList, search]);

    const onItemPress = async (item: listtype) => {
        const log = await ChatLog.getChatLogInstance();
        if (item.id in log.groupInfo) {
            navigation.navigate("Chat", { groupID: item.id, name: item.name, avatar: item.avatar_url, verified: item.verified })
        } else {
            setSelectedItem(item);
            setRenderGroupInbox(true);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            {renderGroupInbox ?
                <InboxSettings 
                    group={{ _id: selectedItem.id, name: selectedItem.name, avatar: selectedItem.avatar_url }}
                    verified="Y"
                    newToGroup
                />
                :
                <>
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
                        placeholder="Search for chats, courses or users"
                        onChangeText={(text) => setSearch(text)}
                        value={search}
                        showCancel={false}
                    />
                    {loading ?
                        <ActivityIndicator />
                        :
                        <>
                            {filteredGroupList.length > 0 && <BaseList 
                                title="Recent Chats"
                                items={filteredGroupList.filter(row => row.verified === 'N').slice(0, 5)}
                                itemOnPress={l => onItemPress(l)}
                            />}
                            {filteredCourseList.length > 0 && <BaseList
                                title="Verified Course Groups"
                                items={filteredCourseList.filter(row => row.verified === 'Y').slice(0, 5)}
                                itemOnPress={l => onItemPress(l)}
                            />}
                            {filteredUserList.length > 0 && <BaseList
                                title="Users"
                                items={filteredUserList}
                                itemOnPress={l => navigation.navigate('Profile', { id: l.id })}
                                onAvatarClick={id => navigation.navigate('Profile', { id })}
                            />}
                        </>
                    }
                </ScrollView>
                </>
            }
        </View>
    )
}

export default GroupSearch


