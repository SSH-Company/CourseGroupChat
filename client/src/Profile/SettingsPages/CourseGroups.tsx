import React, { useState, useEffect } from 'react';
import { Dimensions, View, ScrollView, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Header, ListItem, SearchBar, Avatar, Button } from "react-native-elements";
import { AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleLeaveGroup, handleError } from '../../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';


const deviceDimensions = Dimensions.get('window')

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
            .catch(err => handleError(err))

        return () => { mounted = false; }
    }, [loading, groups])

    if (loading) {
        return <ActivityIndicator />
    } else {
        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="left"
                    backgroundColor={THEME_COLORS.HEADER}
                    statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                    leftComponent={
                        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                            <AntDesign 
                                name="left" 
                                size={25} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.goBack()}
                            />
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: deviceDimensions.fontScale*20, paddingLeft: 10 }}>Course Group Chats</Text>
                        </View>
                    }
                />
                {groups.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: "black", fontSize: 20, padding: 40, textAlign: 'center' }}>You are not enrolled in any course group chats. Join now to connect with your friends!</Text>
                    </View>
                    :
                    <>
                        <Text style={{ marginLeft: 5, marginTop: 20, color: "black", fontSize: 20 }}>You are enrolled in</Text>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {groups.map((group, index) => (
                                <ListItem key={`${group.id}`} topDivider={index > 0}>
                                    <Avatar
                                        source={{ uri: EMPTY_IMAGE_DIRECTORY }}
                                        rounded
                                        size={50}
                                    />
                                    <ListItem.Content>
                                        <ListItem.Title style={{ fontSize: 15 }}>{group.id}</ListItem.Title>
                                        <ListItem.Subtitle style={{ fontSize: 10 }}>{group.name}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <Button 
                                        title="X"
                                        onPress={() => handleLeaveGroup([], group.id, true, () => setLoading(true))} 
                                        buttonStyle={{ borderRadius: 100, backgroundColor: '#915A3C' }}
                                    />
                                </ListItem>
                            ))}
                        </ScrollView>
                    </>
                }
                <View style={{ marginBottom: 100 }}>
                    <Text style={{ textAlign: 'center', marginBottom: 10 }}>Max 8 course group chats can be added at a time</Text>
                    <SearchBar
                        platform={"android"}
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