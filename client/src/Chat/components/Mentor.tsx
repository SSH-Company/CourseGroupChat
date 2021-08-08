import React, { FunctionComponent } from 'react';
import { 
    SafeAreaView, 
    View,
    Text,
    ScrollView,
    StyleSheet,
    Slider
} from "react-native";
import { Avatar, Header, Button, ListItem } from "react-native-elements";
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { EMPTY_IMAGE_DIRECTORY } from '../../BaseUrl';
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';

const style = StyleSheet.create({
    headerText: {
        fontSize: 20,
        color: 'black'
    },
    feedbackContainer: {
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1,
        padding: 15,
        marginTop: 15
    }
});

const LikeCount: FunctionComponent<{ count: number, type: "like" | "dislike" }> = ({ count, type }) => {
    return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: type === "like" ? THEME_COLORS.GREEN : THEME_COLORS.STATUS_BAR, fontWeight: 'bold', paddingRight: 5 }}>{count}</Text>
            <AntDesign
                name={type === "like" ? "like2" : "dislike2"} 
                size={18} 
            />
        </View> 
    )
}

const Mentor = ({ route, navigation }) => {

    const { course } = route.params;

    const list = [
        {
            name: 'Joanna Miles',
            avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/00/002e408e1f118c451cbf608558aeeff7c3bca616_full.jpg',
            subtitle: 'CS Specialist, On PEY',
            likes: 10,
            dislikes: 1
        },
        {
            name: 'John Hendricks',
            avatar: 'https://i.pravatar.cc/300?img=2',
            subtitle: 'CS and Stats Double Major, Year 4',
            likes: 5,
            dislikes: 0
        },
        {
            name: 'Winnie Gilmore',
            avatar: 'https://i.pravatar.cc/300?img=5',
            subtitle: 'ECE, Year 3',
            likes: 2,
            dislikes: 1
        },
        {
            name: 'Janie Valentine',
            avatar: 'https://i.pravatar.cc/300?img=10',
            subtitle: 'CS Specialist, Year 3',
            likes: 0,
            dislikes: 0
        },
        {
            name: 'Tim Allen',
            avatar: null,
            subtitle: 'ECE, Year 4',
            likes: 0,
            dislikes: 0
        }
    ];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header
                placement="left"
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent={
                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <AntDesign 
                            name="left" 
                            size={20} 
                            color={THEME_COLORS.ICON_COLOR}
                            onPress={() => navigation.goBack()}
                        />      
                    </View>
                }
                centerComponent={
                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ color: THEME_COLORS.ICON_COLOR, fontSize: 20, fontWeight: 'bold' }}>{course} Mentors</Text>
                    </View>
                }
                leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 20, paddingBottom: 0 }}>
                    <Text style={style.headerText}>Connect with {course} mentor</Text>
                    <Text style={[style.headerText, { fontSize: 16 }]}>(All mentors have successfully completed the course with above average grade)</Text>
                </View>
                <ScrollView style={{ paddingTop: 20 }}>
                    {list.map((l, i) => (
                        <ListItem
                            key={i}
                            topDivider={i > 0}
                        >
                            <Avatar
                                source={{ uri: l.avatar || EMPTY_IMAGE_DIRECTORY }}
                                rounded
                                size={50}
                            />
                            <ListItem.Content>
                                <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between", minWidth: '100%' }}>
                                    <ListItem.Title>{l.name}</ListItem.Title>
                                    <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between", minWidth: 75 }}>
                                        <LikeCount count={l.likes} type="like"/>
                                        <LikeCount count={l.dislikes} type="dislike"/>
                                    </View>
                                </View>
                                {l.subtitle && <ListItem.Subtitle style={{ fontSize: 12 }}>{l.subtitle}</ListItem.Subtitle>}
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </ScrollView>
            </SafeAreaView>
            <Text style={{ textAlign: 'center', padding: 20 }}>________</Text>
            <SafeAreaView style={{ flex: 0.3, alignContent: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}>Have you successfully completed this course?</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}>Apply now to be a mentor</Text>
                <Button
                    title="Become a Mentor"
                    onPress={() => {}}
                    buttonStyle={{ backgroundColor: THEME_COLORS.GREEN }}
                    containerStyle={{ maxWidth: 200, alignSelf: 'center', padding: 10 }}
                />
            </SafeAreaView>
        </SafeAreaView>
    )
}


export default Mentor

