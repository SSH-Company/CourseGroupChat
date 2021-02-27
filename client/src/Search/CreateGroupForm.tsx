import React, { useState } from "react";
import { View } from "react-native";
import { Header, Input } from "react-native-elements";
import { Ionicons } from 'react-native-vector-icons';

const CreateGroupForm = ({ navigation }) => {
    const [groupName, setGroupName] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();

    const handleFormSubmit = () => {
        if (!groupName) {
            setErrorMessage('Group name is required');
            return
        }

        //clear error message
        setErrorMessage('');
        navigation.navigate('Search', { groupName: groupName })
    }

    return (
        <View style={{ flex: 1 }}>
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent={
                    <Ionicons 
                    name="arrow-back-sharp" 
                    size={25} 
                    color="#734f96" 
                    onPress={() => navigation.navigate('Main')}
                />}
                centerComponent={{
                    text: "Create Group",
                    style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
                }}
                rightComponent={
                    <Ionicons 
                    name="checkmark-sharp" 
                    size={25} 
                    color="#734f96" 
                    onPress={() => handleFormSubmit()}
                />}
            />
            <Input 
                placeholder="Group name (Required)"
                onChangeText={value => setGroupName(value)}
                errorStyle={{ color: 'red' }}
                errorMessage={errorMessage}
            />
        </View>
    )
}

export default CreateGroupForm;