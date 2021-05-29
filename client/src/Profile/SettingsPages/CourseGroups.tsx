import React, { useState, useEffect } from 'react';
import { View, ScrollView, Button, Text, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { Header, ListItem, SearchBar } from "react-native-elements";
import { MaterialIcons, AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleLeaveGroup } from '../../Util/CommonFunctions';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

type CourseGroups = {
    id: string,
    name: string
}

const style = StyleSheet.create({
    searchBar: {
        borderRadius: 50,
        borderWidth: 1,
        alignSelf: 'center',
        width: '90%'
    }
})

const CourseGroups = ({ navigation }) => {

    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<CourseGroups[]>([]);

    useEffect(() => {
        let mounted = true;
        axios.get(`${BASE_URL}/api/profile/course-groups`)
            .then(res => {
                if (mounted) {
                    setGroups(res.data);
                    setLoading(false);
                }
            })
            .catch(err => console.log(err))

        return () => { mounted = false; }
    }, [loading, groups])

    if (loading) {
        return <ActivityIndicator />
    } else {
        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="left"
                    backgroundColor={"white"}
                    statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                    leftComponent={
                        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                            <AntDesign 
                                name="left" 
                                size={30} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.goBack()}
                            />
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: 25, paddingLeft: 10 }}>Course Group Chats</Text>
                        </View>
                    }
                />
                <Text style={{ marginLeft: 5, marginTop: 20, color: "black", fontSize: 20 }}>You are enrolled in</Text>
                <ScrollView keyboardShouldPersistTaps="handled">
                    {groups.map(group => (
                        <ListItem key={`${group.id}`} bottomDivider>
                            <MaterialIcons 
                                name="groups" 
                                size={30} 
                                color={THEME_COLORS.ICON_COLOR} 
                            />
                            <ListItem.Content>
                                <ListItem.Title style={{ fontSize: 15 }}>{group.name}</ListItem.Title>
                            </ListItem.Content>
                            <Button 
                                title="x" 
                                color="red" 
                                onPress={() => handleLeaveGroup([], group.id, true, () => setLoading(true))} />
                        </ListItem>
                    ))}
                </ScrollView>
                <View style={{ marginBottom: 100 }}>
                    <Text style={{ textAlign: 'center' }}>You can enroll in upto 8 course group chats at a time</Text>
                    <SearchBar
                        platform={Platform.OS === "android" ? "android" : "ios"}
                        placeholder="Add new course group chat"
                        containerStyle={style.searchBar}
                        onFocus={() => navigation.navigate('CourseSearch', { enrolledGroups: groups.map(g => g.id) })}
                    />
                </View>
            </View>
        )
    }
}

export default CourseGroups