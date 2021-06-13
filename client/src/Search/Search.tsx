import React, { useMemo, useState, useEffect } from "react";
import { Text, View, ScrollView, Platform, StyleSheet, Dimensions } from "react-native";
import { Avatar, Header, SearchBar, Button } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleError } from "../Util/CommonFunctions";
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

//style sheet
const style = StyleSheet.create({
    search: {},
    submit: {
        color: THEME_COLORS.ICON_COLOR
    },
    suggested: {
        fontWeight: "bold",
        color: "grey",
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10
    },
    members: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    memberItem: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20
    }
})

type SearchProp = {
    groupName: string,
    groupID?: string,   //required if search type === "add"
    searchType: "add" | "create",
    existingMembers?: string[]
}

const Search = ({ route, navigation }) => {
    const { 
        groupName, 
        groupID = '', 
        searchType,
        existingMembers = []
    } = route.params as SearchProp;
    const [search, setSearch] = useState("");
    const [displaySubmit, setDisplaySubmit] = useState(false);
    const [suggestions, setSuggestions] = useState<listtype[]>([]);
    const dimesions = Dimensions.get('window');
    const renderLimit = 20;

    const filteredTable = useMemo<listtype[]>(() => {
        const table = suggestions.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, renderLimit);
        return table;
    }, [suggestions, search])

    //retrieve data on first load
    useEffect(() => {
        axios.get(`${BASE_URL}/api/search/friends`, { params: { excludeIds: existingMembers } })
            .then(res => setSuggestions(res.data.map(row => ({ ...row, checked: false }))))
            .catch(err => handleError(err))
    }, [])

    useEffect(() => {
        let checked = false
        suggestions.map(row => {
            if (row.checked) {
                checked = true
                return
            }
        })
        setDisplaySubmit(checked)
    }, [suggestions])

    const toggleCheckbox = (index: number) => {
        const newSuggestions = suggestions;
        newSuggestions[index].checked = !newSuggestions[index].checked;
        setSuggestions([...newSuggestions]);
    }

    const handleSubmit = () => {
        const recipients = suggestions.filter(row => row.checked).map(row => ({
            id: row.id,
            name: row.name.split(" ")[0]
        }))
        
        if (searchType === "create") {
            const name = suggestions.filter(row => row.checked).map(row => row.name).join(", ");
            navigation.navigate('Chat', { groupID: null, name: name, members: recipients })
        } 
        else if (searchType === "add") {
            const reqBody = {
                groupID: groupID,
                groupName: groupName,
                recipients: recipients.map(d => d.id)
            }

            //add the members in the backend
            axios.post(`${BASE_URL}/api/search/add-members`, reqBody)
                .then(res => {
                    navigation.navigate('Chat', { groupID: groupID })
                })
                .catch(err => handleError(err))
        }   
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={<Feather name="arrow-left" color={THEME_COLORS.ICON_COLOR} size={25} onPress={() => navigation.navigate("Main")}/>}
                centerComponent={{
                    text: "Send Message",
                    style: { color: THEME_COLORS.ICON_COLOR, fontSize: 20, fontWeight: "bold" },
                }}
                rightComponent={displaySubmit && 
                    <View>
                        <Button title="OK" onPress={() => handleSubmit()} />
                    </View>
                }
            />
            {suggestions.length > 0 &&
            <SearchBar
                platform={Platform.OS === "android" ? "android" : "ios"}
                clearIcon={{ size: 30 }}
                placeholder="Search contacts"
                onChangeText={(text) => setSearch(text)}
                onCancel={() => setSearch('')}
                value={search}
                style={style.search}
            />}
            <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
                {suggestions.length > 0 &&
                <View style={style.members}>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {suggestions.map((l, i) => ( 
                        l.checked &&
                        <View key={`${i}-${l.checked}`} style={style.memberItem}>
                            <Avatar 
                                rounded 
                                size="large" 
                                source={{ uri: l.avatar_url || EMPTY_IMAGE_DIRECTORY }} 
                                onPress={() => toggleCheckbox(i)}/>
                            <Text style={{ fontWeight: "bold", color: "black", alignSelf: 'stretch', textAlign: 'center' }} textBreakStrategy="simple">
                                {l.name.split(" ")[0]}
                            </Text>
                        </View>
                    ))}
                    </ScrollView>
                </View>}
            {filteredTable.length > 0 ?
                <BaseList
                    title="Suggested"
                    items={filteredTable}
                    itemOnPress={(l, i) => toggleCheckbox(i)}
                    checkBoxes
                />
                :
                <View style={{ paddingTop: dimesions.height / 3, alignSelf: 'center' }}>
                    <Text style={{ color: 'grey' }}>Add people to your friend list to add them to groups!</Text>
                </View>
            }
            </ScrollView>
        </View>
    )
}

export default Search
