import React, { useMemo, useState, useEffect } from "react";
import { Text, View, ScrollView, Platform, StyleSheet } from "react-native";
import { Avatar, Header, SearchBar, Button } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";
import BaseList, { listtype } from '../Util/CommonComponents/BaseList';
import { BASE_URL, EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import axios from 'axios';

//style sheet
const style = StyleSheet.create({
    search: {},
    submit: {
        color: '#734f96'
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
    photo?: any,     
    searchType: "add" | "create",
    existingMembers?: string[]
}

const Search = ({ route, navigation }) => {
    const { 
        groupName, 
        groupID = '', 
        photo = {}, 
        searchType,
        existingMembers = []
    } = route.params as SearchProp;
    const [search, setSearch] = useState("");
    const [displaySubmit, setDisplaySubmit] = useState(false);
    const [suggestions, setSuggestions] = useState<listtype[]>([]);
    const renderLimit = 20;

    const filteredTable = useMemo<listtype[]>(() => {
        const table = suggestions.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, renderLimit);
        return table;
    }, [suggestions, search])

    //retrieve data on first load
    useEffect(() => {
        axios.get(`${BASE_URL}/api/search/users`, { params: { excludeIds: existingMembers } })
            .then(res => setSuggestions(res.data.map(row => ({ ...row, checked: false }))))
            .catch(err => console.error(err))
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
        const recipients = suggestions.filter(row => row.checked).map(row => row.id)
        
        if (searchType === "create") {
            const formData = new FormData();
            if (photo !== '') formData.append('avatar', {...photo});
            formData.append('recipients', JSON.stringify(recipients));
            formData.append('groupName', groupName);
    
            //create the group in the backend
            axios.post(`${BASE_URL}/api/search/create-group`, formData, { headers: { 'content-type': 'multipart/form-data' } })
                .then(async res => {
                    const data = res.data;
                    navigation.navigate('Chat', { groupID: data.id, name: data.name, avatar: data.avatar_url })
                })
                .catch(err => console.log(err))
        } 
        else if (searchType === "add") {
            const reqBody = {
                groupID: groupID,
                groupName: groupName,
                recipients: recipients
            }

            //add the members in the backend
            axios.post(`${BASE_URL}/api/search/add-members`, reqBody)
                .then(res => {
                    navigation.navigate('Chat', { groupID: groupID })
                })
                .catch(err => console.log(err))
        }   
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent={<Feather name="arrow-left" color="#734f96" size={30} onPress={() => navigation.navigate("Main")}/>}
                centerComponent={{
                    text: "Choose Members",
                    style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
                }}
                rightComponent={displaySubmit && 
                    <View style={{width: '60%'}}>
                        <Button title="OK" onPress={() => handleSubmit()} />
                    </View>
                }
            />
            <SearchBar
                platform={Platform.OS === "android" ? "android" : "ios"}
                clearIcon={{ size: 30 }}
                placeholder="Search contacts"
                onChangeText={(text) => setSearch(text)}
                onCancel={() => setSearch('')}
                value={search}
                style={style.search}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
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
            </View>
            <BaseList
                title="Suggested"
                items={filteredTable}
                itemOnPress={(l, i) => toggleCheckbox(i)}
                checkBoxes
            />
            </ScrollView>
        </View>
    )
}

export default Search
