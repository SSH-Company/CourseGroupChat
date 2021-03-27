import React, { useState, useEffect } from 'react';
import { ActivityIndicator, BackHandler, View, ScrollView } from "react-native";
import { Header } from "react-native-elements";
import { navigationRef } from '../../Util/RootNavigation';
import { Ionicons } from "react-native-vector-icons";
import BaseList from '../../Util/CommonComponents/BaseList';
import BASE_URL from '../../../BaseUrl';
import axios from 'axios';

type listtype = {
    id: string;
    name: string;
    avatar_url: string;
    checked: boolean; 
}

const GroupMembers = ({ route, navigation }) => {

    const { id, name } = route.params;
    const [members, setMembers] = useState<listtype[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayRemove, setDisplayRemove] = useState(false);

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
    }, [id])

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

    const handleRemoveUsers = () => {
        const selections = members.filter(member => member.checked);
        console.log(selections);
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
                            onPress={() => navigation.navigate('Search', { groupName: name, groupID: id, searchType: "add" })}
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
                        renderBasedOnCheckbox
                    />
                </ScrollView>
            }
        </View>
    )

}

export default GroupMembers