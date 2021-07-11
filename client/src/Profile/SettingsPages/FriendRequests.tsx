import React, { useState, useEffect } from 'react';
import { Dimensions, View, ScrollView , Button, Text } from "react-native";
import { Header } from "react-native-elements";
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import BaseList, { listtype } from '../../Util/CommonComponents/BaseList';
import { handleError } from '../../Util/CommonFunctions';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';

const deviceDimensions = Dimensions.get('window')

const FriendRequests = ({ navigation }) => {
    const [list, setList] = useState<listtype[]>([]);

    const acceptRequest = (id: string, index: number) => {
        axios.put(`${BASE_URL}/api/profile/friend-request`, { id: id })
            .then(() => {
                setList(prevList => {
                    const tempList = [...prevList];
                    tempList[index].subtitle = 'You are now friends.';
                    tempList[index].content = null;
                    return tempList;
                });
            })
            .catch(err => handleError(err));
    }

    const cancelRequest = (id: string, index: number) => {
        axios.delete(`${BASE_URL}/api/profile/friend-request`, { data: { id: id }})
            .then(() => {
                setList(prevList => {
                    const tempList = [...prevList];
                    tempList.splice(index, 1);
                    return tempList;
                });
            })
            .catch(err => handleError(err));
    }

    useEffect(() => {
        axios.get(`${BASE_URL}/api/profile/friend-request`)
            .then(res => setList(res.data.map((row, index) => ({ 
                ...row,
                content: 
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 150 }}>
                        <Button title="Accept" color="green" onPress={() => acceptRequest(row.id, index)}/>
                        <Button title="Cancel" color="red" onPress={() => cancelRequest(row.id, index)}/>
                    </View>
            }))))
            .catch(err => handleError(err))
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <AntDesign 
                            name="left" 
                            size={25} 
                            color={THEME_COLORS.ICON_COLOR} 
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                }
                centerComponent={{
                    text: "Friend Requests",
                    style: { fontWeight: "bold", color: "black", fontSize: deviceDimensions.fontScale*20 }
                }}
                leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                rightContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            />
            {list.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: "black", fontSize: 20, padding: 40, textAlign: 'center' }}>No pending requests.</Text>
                    </View>
                    :
            <ScrollView keyboardShouldPersistTaps="handled">
                <BaseList
                    items={list}
                />
            </ScrollView>
            }
        </View>
    )

}

export default FriendRequests
