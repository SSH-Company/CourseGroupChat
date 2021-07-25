import React, { useEffect, useState} from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Text} from "react-native";
import { Header, ListItem, Avatar } from "react-native-elements";
import { Ionicons} from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const styles = StyleSheet.create ({
    item: {
       padding: 10
    }
 })
 
const deviceDimensions = Dimensions.get('window')

type Friends = {
    avatar: string,
    name: string,
    id: string
}

const Friends = ({ navigation }) => {

    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState<Friends[]>([]);

    useEffect(() => {
        let mounted = true;
        axios.get(`${BASE_URL}/api/profile/friends`)
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
                    statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                    leftComponent={
                        <View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                            <Ionicons 
                                name="arrow-back-sharp" 
                                size={deviceDimensions.scale*10} 
                                color={THEME_COLORS.ICON_COLOR} 
                                onPress={() => navigation.goBack()}
                            />
                            <Text style={{ fontWeight: "bold", color: "black", fontSize: 20*deviceDimensions.fontScale }}> My Friends</Text>
                        </View>
                    }
                /> 
                {friends.length === 0 ?
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ color: "black", fontSize: 20, padding: 40, textAlign: 'center' }}>This list is empty.</Text>
                    </View>
                    :
                <>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.item}>
                    {friends.map((friends, index) => (
                        <ListItem key={`${friends.id}`} topDivider={index > 0}>
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
            }                   
            </View>
        )
    }


export default Friends