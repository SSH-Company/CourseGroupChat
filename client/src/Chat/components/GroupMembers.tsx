import React, { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, BackHandler, View, ScrollView } from "react-native";
import { Header } from "react-native-elements";
import { navigationRef } from '../../Util/RootNavigation';
import { Ionicons } from "react-native-vector-icons";
import { UserContext } from '../../Auth/Login';
import BaseList from '../../Util/CommonComponents/BaseList';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';

type listtype = {
    id: string;
    name: string;
    avatar_url: string;
    checked: boolean; 
}

const GroupMembers = ({ route, navigation }) => {

    const { id, name } = route.params;
    const { user } = useContext(UserContext);
    const [members, setMembers] = useState<listtype[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayRemove, setDisplayRemove] = useState(false);
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        const backAction = () => {
            navigationRef.current.goBack();
          return true
        };
    
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );
    
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get(`${BASE_URL}/api/chat/group-members/${id}`)
            .then(res => {
                setMembers(res.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    }, [id, refresh])

    useEffect(() => {
        let checked = false
        members.map(row => {
            if (row.checked) {
                checked = true
                return
            }
        })
        setDisplayRemove(checked)
    }, [members])

    const toggleCheckbox = (index: number) => {
        const newItems = [...members];
        newItems[index].checked = !newItems[index].checked;
        setMembers(newItems);
    }

    const handleRemoveUsers = async () => {
        const selections = members.filter(member => member.checked).map(row => row.id.toString());
        const reqBody = {
            users: selections,
            grpId: id,
            leave: false
        }

        try {
            await axios.delete(`${BASE_URL}/api/chat/remove-from-group`, { data: reqBody });
            //if the user also removed them selves, they have effectively left the group
            if (selections.includes(user._id.toString())) {
                //refresh and navigate back to Main 
                navigation.navigate('Main');
            } else setRefresh(!refresh);

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor="#ccccff"
                leftComponent={
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <Ionicons 
                            name="arrow-back-sharp" 
                            size={30} 
                            color="#734f96" 
                            onPress={() => navigationRef.current.goBack()}
                        />
                    </View>
                }
                centerComponent={{
                    text: "Members",
                    style: { fontWeight: "bold", color: "white", fontSize: 25 }
                }}
                rightComponent={
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                        {displayRemove &&
                        <Ionicons
                            name="person-remove-sharp"
                            size={30}
                            color="#734f96"
                            style={{ paddingRight: 10 }}
                            onPress={handleRemoveUsers}
                        />}
                        <Ionicons
                            name="person-add"
                            size={30}
                            color="#734f96"
                            onPress={() => navigation.navigate('Search', 
                                {   groupName: name, 
                                    groupID: id, 
                                    searchType: "add",
                                    existingMembers: members.map(mem => mem.id)
                                })}
                        />
                    </View>
                }
            />
            {loading ?
                <ActivityIndicator />
                :
                <ScrollView keyboardShouldPersistTaps="handled">
                    <BaseList
                        items={members}
                        itemOnPress={(l, i) => toggleCheckbox(i)}
                        checkBoxes
                    />
                </ScrollView>
            }
        </View>
    )

}

export default GroupMembers