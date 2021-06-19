import React, { useEffect, useState} from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Text} from "react-native";
import { Header, ListItem, SearchBar } from "react-native-elements";
import { Ionicons} from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';
import { handleLeaveGroup } from '../../Util/CommonFunctions';
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';
axios.defaults.headers = { withCredentials: true };

const styles = StyleSheet.create ({
    item: {
       padding: 10
    }
 })
 
const deviceDimensions = Dimensions.get('window')

type CommonCourseGroups = {
    id: string,
    name: string
}

const CommonCourseGroups = ({ route, navigation }) => {

    const { id } = route.params;
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<CommonCourseGroups[]>([]);

    useEffect(() => {
        let mounted = true;
        axios.get(`${BASE_URL}/api/profile/mutual-course-groups`, { params: { id } })
            .then(res => {
                // console.log(res.data)
                if (mounted) {
                    // const id = res.data[0].id
                    // const name = res.data[0].name
                    // const result = Array.from(
                    //     id.map((e, i) => ({id: e, name: name[i]}))
                    //         .reduce((a, b) => a.set(b.id, (a.get(b.id) || []).concat(b.name)), new Map))
                    //     .map(([k, v]) => ({id:k, name: v.join()}));
                                        
                    setGroups(res.data);
                    setLoading(false);
                }
            })
            .catch(err => console.log(err))

        return () => { mounted = false; }

    }, [loading])
    
    // const course_ids = res
    return (
        <><View style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                leftComponent={<View style={{ display: "flex", flexDirection: "row", alignItems: 'center' }}>
                    <Ionicons
                        name="arrow-back-sharp"
                        size={deviceDimensions.scale * 10}
                        color={THEME_COLORS.ICON_COLOR}
                        onPress={() => navigation.goBack()} />
                    <Text style={{ fontWeight: "bold", color: "black", fontSize: 20 * deviceDimensions.fontScale }}> Common Course Groups</Text>
                </View>} />

                <>
                <ScrollView keyboardShouldPersistTaps="handled" style={styles.item}>
                    {groups.map((group, index) => (
                        <ListItem key={`${group.id}`} topDivider={index > 0}>
                            <ListItem.Content>
                                <ListItem.Title style={{ fontSize: 16 * deviceDimensions.fontScale }}>{group.id}</ListItem.Title>
                                <ListItem.Subtitle style={{ fontSize: 12 * deviceDimensions.fontScale}}>{group.name}</ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </ScrollView>
            </>  
        </View>

            
        </>

        
    )
    }


export default CommonCourseGroups