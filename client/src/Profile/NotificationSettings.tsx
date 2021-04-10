import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';
import { Ionicons } from 'react-native-vector-icons';
import { navigationRef } from '../Util/RootNavigation';

const NotificationSettings = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const styles = StyleSheet.create({
        container: {
          flex: 1,
        }
    });

    return (
        <View style={styles.container}>
            <Header
                placement="center"
                backgroundColor="#ccccff"
                leftComponent = {
                    <Ionicons 
                        name="arrow-back-sharp"
                        size={25}
                        color="#734f96"
                        // onPress={() => navigation.navigate('Profile')}
                    />
                }
                centerComponent={{
                    text: "Notifications",
                    style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
                }}
            />
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
        </View>
    )
}

export default NotificationSettings;