import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, Platform, StyleSheet } from "react-native";
import { ListItem, Avatar, Header, SearchBar, CheckBox } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";

type listtype = {
    id: number;
    name: string;
    avatar_url: string;
    checked: boolean
}

//style sheet
const style = StyleSheet.create({
    search: {},
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
                    id: 1,
                    name: 'Tanvir Shahriar',
                    avatar_url: 'https://placeimg.com/140/140/any',
                    checked: false
                },
                {
                    id: 2,
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

const Search = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<listtype[]>([]);

    //retrieve data on first load
    useEffect(() => {
        getData()
            .then((data: listtype[]) => setSuggestions(data))
            .catch(err => console.error(err))
    }, [])

    const toggleCheckbox = (index: number) => {
        const newSuggestions = suggestions;
        newSuggestions[index].checked = !newSuggestions[index].checked;
        setSuggestions([...newSuggestions]);
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
            />
            <ScrollView
                contentOffset={{ x: 0, y: 76 }}
                keyboardShouldPersistTaps="handled"
            >
            <SearchBar
                platform={Platform.OS === "android" ? "android" : "ios"}
                clearIcon={{ size: 30 }}
                placeholder="Search messages"
                onChangeText={(text) => {}}
                onCancel={() => {}}
                value={search}
                style={style.search}
            />
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
                    <ListItem.CheckBox checked={l.checked} onPress={() => toggleCheckbox(i)}/>
                </ListItem>
            ))}
            </ScrollView>
        </View>
    )
}

export default Search
