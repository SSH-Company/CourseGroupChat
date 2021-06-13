import React, { useEffect, useState} from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Text} from "react-native";
import { Header, ListItem, Avatar } from "react-native-elements";
import { Ionicons} from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleLeaveGroup } from '../../Util/CommonFunctions';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';
import { BackHandler } from 'react-native';
axios.defaults.headers = { withCredentials: true };

const styles = StyleSheet.create ({
    item: {
       padding: 10
    }
 })
 
const deviceDimensions = Dimensions.get('window')

type MutualFriends = {
    avatar: string,
    name: string,
    id: string
}

const MutualFriends = ({ route, navigation }) => {

    const { id } = route.params;
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState<MutualFriends[]>([]);

    useEffect(() => {
        let mounted = true;
        axios.get(`${BASE_URL}/api/profile/mutual-friends`, { params: { id } })
            .then(res => {
                // console.log(res.data)
                if (mounted) {                                                         
                    setFriends(res.data);
                    setLoading(false);
                }
            })
            .catch(err => console.log(err))

        return () => { mounted = false; }

    }, [loading])

    
        return (
            <View style={{ flex: 1 }}>
                <Header
                    placement="left"
                    backgroundColor={THEME_COLORS.HEADER}
                    leftComponent={
                        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                            <Ionicons 
                                name="arrow-back-sharp" 
                                size={deviceDimensions.scale*10} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.goBack()}
                            />
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: 20*deviceDimensions.fontScale }}> Mutual Friends</Text>
                        </View>
                    }
                /> 

                <>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.item}>
                    {friends.map((friends, index) => (
                        <ListItem key={`${friends.avatar}`} topDivider={index > 0}>
                            <Avatar
                                        source={{ uri: friends.avatar }}
                                        rounded
                                        size={50}
                                        onPress={() => navigation.navigate("Profile", { id: friends.id })}                                        
                                    />
                            <ListItem.Content>                                    
                                <ListItem.Title style={{ fontSize: 16 * deviceDimensions.fontScale}}>{friends.name}</ListItem.Title>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </ScrollView>
            </>                 
            </View>
        )
    }


export default MutualFriends