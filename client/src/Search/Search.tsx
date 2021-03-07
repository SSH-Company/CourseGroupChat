import React, { useState, useEffect, useContext } from "react";
import { Button, Text, View, ScrollView, Platform, StyleSheet } from "react-native";
import { ListItem, Avatar, Header, SearchBar } from "react-native-elements";
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from "../Util/ChatLog";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import BASE_URL from '../../BaseUrl';
import axios from 'axios';

type SearchProps = {
    groupName: string
}

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


//example list data
const getData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([
                {
                    id: 2,
                    name: 'Tanvir Shahriar',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 1,
                    name: 'Sadman Hasan',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                }, 
                {
                    id: 3,
                    name: 'Farhad Siddique',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 4,
                    name: 'Test user',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 5,
                    name: 'User test',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 6,
                    name: 'Asasas Sasasda',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 7,
                    name: 'User 7',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                }
            ])
        }, 500)
    })
}

const Search = ({ route, navigation }) => {
    const { user, setUser } = useContext(UserContext);
    const { groupName } = route.params as SearchProps;
    const [search, setSearch] = useState("");
    const { renderFlag, setRenderFlag } = useContext(RenderMessageContext);
    const [displaySubmit, setDisplaySubmit] = useState(false);
    const [suggestions, setSuggestions] = useState<listtype[]>([]);

    //retrieve data on first load
    useEffect(() => {
        getData()
            .then((data: listtype[]) => setSuggestions(data))
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
        const requestBody = {
            sender: user._id,
            recipients: recipients,
            groupName: groupName
        }

        //create the group in the backend
        axios.post(`${BASE_URL}/api/group`, requestBody)
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
                onChangeText={(text) => {}}
                onCancel={() => {}}
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
            {suggestions.map((l, i) => (
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
