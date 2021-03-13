import React, { useMemo, useState, useEffect, useContext } from "react";
import { Button, Text, View, ScrollView, Platform, StyleSheet } from "react-native";
import { ListItem, Avatar, Header, SearchBar } from "react-native-elements";
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from "../Util/ChatLog";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type listtype = {
    id: number;
    name: string;
    avatar_url: string;
    checked: boolean
}

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

const Search = ({ route, navigation }) => {
    const { groupName, photo } = route.params;
    const [search, setSearch] = useState("");
    const { renderFlag, setRenderFlag } = useContext(RenderMessageContext);
    const [displaySubmit, setDisplaySubmit] = useState(false);
    const [suggestions, setSuggestions] = useState<listtype[]>([]);
    const renderLimit = 20;

    const filteredTable = useMemo<listtype[]>(() => {
        const table = suggestions.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, renderLimit);
        return table;
    }, [suggestions, search])

    //retrieve data on first load
    useEffect(() => {
        axios.get(`${BASE_URL}/api/group`)
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
        const formData = new FormData();
        formData.append('avatar', {...photo});
        formData.append('recipients', JSON.stringify(recipients));
        formData.append('groupName', groupName);

        //create the group in the backend
        axios.post(`${BASE_URL}/api/group`, formData, { headers: { 'content-type': 'multipart/form-data' } })
            .then(async res => {
                const data = res.data;
                await ChatLog.getChatLogInstance(true);
                setRenderFlag(!renderFlag);
                navigation.navigate('Chat', {
                    groupID: { id: data.id, name: data.name, avatar: data.avatar_url }
                })
            })
            .catch(err => console.log(err))
    }

    return (
        <View style={{ flex: 1}}>
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
                        <Button title="OK" color="#734f96" onPress={() => handleSubmit()} />
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
                            source={{ uri: l.avatar_url }} 
                            onPress={() => toggleCheckbox(i)}/>
                        <Text style={{ fontWeight: "bold", color: "black", alignSelf: 'stretch', textAlign: 'center' }}
                            textBreakStrategy="simple"
                        >{l.name.split(" ")[0]}</Text>
                    </View>
                ))}
                </ScrollView>
            </View>
            <Text style={style.suggested}>Suggested</Text>
            {filteredTable.map((l, i) => (
                <ListItem
                    key={`${i}-${l.name}`}
                    onPress={() => toggleCheckbox(i)}
                >
                <Avatar rounded size="medium" source={{ uri: l.avatar_url }} />
                    <ListItem.Content>
                        <ListItem.Title>{l.name}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.CheckBox 
                        checked={l.checked} 
                        checkedIcon={<Ionicons name="checkmark-circle" size={25} color="#734f96"/>} 
                        uncheckedIcon={<Ionicons name="checkmark-circle-outline" size={25} color="#734f96"/>}
                        onPress={() => toggleCheckbox(i)}/>
                </ListItem>
            ))}
            </ScrollView>
        </View>
    )
}

export default Search
