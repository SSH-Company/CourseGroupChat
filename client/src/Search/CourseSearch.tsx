import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View, ScrollView, Button } from "react-native";
import { SearchBar, Header } from "react-native-elements";
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { handleError, handleJoinCourseGroup } from '../Util/CommonFunctions';
import { BASE_URL } from '../BaseUrl';
import axios from 'axios';

const CourseSearch = ({ route, navigation }) => {
    const { enrolledGroups } = route.params;
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [verifiedList, setVerifiedList] = useState<listtype[]>([]);
    const searchRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        searchRef.current.focus();
        axios.get(`${BASE_URL}/api/search/verified-groups`)
            .then(res => {
                if (mounted) {
                    setVerifiedList(res.data.map((row, index) => {
                        const inGroup = enrolledGroups.includes(row.id)
                        const temp = {
                            ...row,
                            content: inGroup ?
                            <Ionicons name="checkmark" size={35} color="green"/>
                            :
                            <Button title="Join" onPress={() => handleJoinCourseGroup(row.id, () => {
                                setVerifiedList(prevList => {
                                    const list = [...prevList];
                                    list[index] = {
                                        ...list[index],
                                        content: <Ionicons name="checkmark" size={35} color="green"/>
                                    }
                                    return list
                                });
                            })}/>     
                        }
                        return temp
                    }));
                    setLoading(false);
                }
            })
            .catch(err => handleError(err))

        return () => { mounted = false; }
    }, []);

    const filteredList = useMemo<listtype[]>(() => {
        const filteredVerifiedList = verifiedList.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 20);
        return filteredVerifiedList.sort();
    }, [verifiedList, search])

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={
                    <AntDesign 
                        name="left" 
                        size={25} 
                        color={THEME_COLORS.ICON_COLOR} 
                        onPress={() => navigation.goBack()}
                    />
                }
                centerComponent={{
                    text: "Join a course group chat",
                    style: { fontWeight: "bold", color: "black", fontSize: 25 }
                }}
                leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >
                <SearchBar
                    ref={searchRef}
                    platform={"android"}
                    clearIcon={{ size: 30 }}
                    placeholder="Search for course group chats"
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
                            items={verifiedList.slice(0, 20)}
                            subtitleStyle={{ fontSize: 12 }}
                        />
                      </>
                      :
                      <BaseList 
                          items={filteredList}
                          subtitleStyle={{ fontSize: 12 }}
                      />
                    )
                }
            </ScrollView>
        </View>
    )
}

export default CourseSearch


