import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Header, ListItem, Avatar, Button } from "react-native-elements";
import { AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleError } from '../../Util/CommonFunctions';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import axios from 'axios';

type IgnoredGroups = {
    id: string,
    name: string,
    avatar: string
}

const IgnoredGroups = ({ navigation }) => {

    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<IgnoredGroups[]>([]);

    useEffect(() => {
        let mounted = true;

        if (loading) {
            axios.get(`${BASE_URL}/api/profile/ignored-groups`)
            .then(res => {
                if (mounted) {
                    setGroups(res.data);
                    setLoading(false);
                }
            })
            .catch(err => handleError(err))
        }

        return () => { mounted = false; }
    }, [loading, groups])

    const handleUnignore = (groupID: string) => {
        axios.post(`${BASE_URL}/api/chat/ignore`, { groupID, status: "N" })
            .then(() => setLoading(!loading))
            .catch(err => {
                console.log(err)
                handleError(err)
            })
    }

    if (loading) {
        return (
            <View style={{ flex: 1 }}>
                <ActivityIndicator />
            </View>
        )
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
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: 25, paddingLeft: 10 }}>Ignored Groups</Text>
                        </View>
                    }
                />
                {groups.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: "black", fontSize: 20, padding: 40, textAlign: 'center' }}>This list is empty.</Text>
                    </View>
                    :
                    <>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {groups.map((group, index) => (
                                <ListItem key={`${group.id}`} topDivider={index > 0}>
                                    <Avatar
                                        source={{ uri: group.avatar || EMPTY_IMAGE_DIRECTORY }}
                                        rounded
                                        size={50}
                                    />
                                    <ListItem.Content>
                                        <ListItem.Title style={{ fontSize: 15 }}>{group.name}</ListItem.Title>
                                    </ListItem.Content>
                                    <Button 
                                        title="Unignore"
                                        onPress={() => handleUnignore(group.id)} 
                                        buttonStyle={{ borderRadius: 100, backgroundColor: '#915A3C' }}
                                    />
                                </ListItem>
                            ))}
                        </ScrollView>
                    </>
                }
            </View>
        )
    }
}

export default IgnoredGroups


