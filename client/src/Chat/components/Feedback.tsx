import React, { FunctionComponent } from 'react';
import { 
    SafeAreaView, 
    View,
    Text,
    ScrollView,
    StyleSheet,
    Slider
} from "react-native";
import { Header, Button } from "react-native-elements";
import { Ionicons, AntDesign } from "react-native-vector-icons";
import { THEME_COLORS } from '../../Util/CommonComponents/Colors';

const style = StyleSheet.create({
    headerText: {
        fontSize: 20,
        color: 'black'
    },
    feedbackContainer: {
        flex: 1,
        borderRadius: 20,
        borderColor: 'black',
        borderWidth: 1,
        padding: 15,
        marginTop: 15
    }
});

//function component for individual feedbacks
const PersonFeedback: FunctionComponent = () => {
    return (
        <SafeAreaView style={style.feedbackContainer}>
            <ScrollView style={{ flex: 1, padding: 10 }}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20, maxWidth: '80%' }}>
                    <Text><Text style={{fontWeight: 'bold' }}>Year: </Text>2021</Text>
                    <Text><Text style={{fontWeight: 'bold' }}>Term: </Text>Winter</Text>
                </View>
                <Text style={{ paddingTop: 20 }}><Text style={{fontWeight: 'bold' }}>Instructor: </Text>Danny Heap</Text>
                <Text style={{ paddingTop: 20 }}><Text style={{fontWeight: 'bold' }}>Average Grade: </Text>B+</Text>
                <Text style={{ paddingTop: 20 }}><Text style={{fontWeight: 'bold' }}>Acheived Grade: </Text>A</Text>
                <Text style={{ paddingTop: 20 }}><Text style={{fontWeight: 'bold' }}>Difficulty Rating: </Text>2/5</Text>
                <Text style={{ paddingTop: 20 }}><Text style={{fontWeight: 'bold' }}>Comments: </Text>This is probably one of the easiest 3rd year CS course,
                if not the easiest. The course is well structured and professor Heap does a great job at explaining 
                the topics. It's easy to get a good grade with minimal effort and the class average is also high compared
                to other courses. That being said, the contents of this course is widely available online and you can
                learn them on your own if you want to.</Text>
            </ScrollView>
        </SafeAreaView>
    )
}


const Feedback = ({ route, navigation }) => {

    const { course } = route.params;
    
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
                        <Text style={{ color: THEME_COLORS.ICON_COLOR, fontSize: 20, fontWeight: 'bold' }}>{course} Feedbacks</Text>
                    </View>
                }
                leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
                centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            />
            <SafeAreaView style={{ flex: 1, padding: 20 }}>
                <View>
                    <Text style={style.headerText}>Average difficulty of the course</Text>
                    <Text style={style.headerText}>(Based on 27 feedbacks)</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', paddingTop: 20 }}>
                    <Text>1 (Birdy)</Text>
                    <Slider
                        minimumValue={0}
                        maximumValue={5}
                        value={2.1}
                        onValueChange={async e => {}}
                        step={0.1}
                        style={{ width: '70%' }}
                    />
                    <Text>5 (Hard)</Text>
                </View>
                <View style={{ paddingTop: 10 }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20 }}>
                        <Text style={{ fontSize: 20, color: 'black', textAlignVertical: 'bottom' }}>Feedbacks</Text>
                        <Button
                            title="Give feedback"
                            onPress={() => {}}
                            buttonStyle={{ backgroundColor: '#1f4e46' }}
                        />
                    </View>
                    <Text style={{ fontSize: 12, paddingTop: 5 }}>Did you take this course? Provide feedback to get Cirkle points!</Text>
                </View>
                <PersonFeedback/>
            </SafeAreaView>
        </SafeAreaView>
    )
}

export default Feedback

