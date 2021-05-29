import React, { useState } from 'react';
import { View, Switch, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';
import { AntDesign } from 'react-native-vector-icons';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
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
                backgroundColor={THEME_COLORS.HEADER}
                statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
                leftComponent = {
                    <AntDesign 
                        name="left"
                        size={25}
                        color={THEME_COLORS.ICON_COLOR}
                        // onPress={() => navigation.navigate('Profile')}
                    />
                }
                centerComponent={{
                    text: "Notifications",
                    style: { color: THEME_COLORS.ICON_COLOR, fontSize: 20, fontWeight: "bold" },
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