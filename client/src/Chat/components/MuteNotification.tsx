import React, { FunctionComponent } from 'react';
import { Text, View, Modal, StyleSheet } from 'react-native';
import { ListItem } from "react-native-elements";

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    }
})

type MuteNotificationProps = {
    visible: boolean,
    onClose: () => any
}

const MuteNotification:FunctionComponent<MuteNotificationProps> = (props: MuteNotificationProps) => {
    const {
        visible,
        onClose = () => {}
    } = props;
    
    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Mute for...</Text>
                <View>
                    <ListItem key={`mute-0`}>
                        <ListItem.CheckBox checked={false}/>
                        <Text>15 mins</Text>
                    </ListItem>
                    <ListItem key={`mute-1`}>
                        <ListItem.CheckBox checked={false}/>
                        <Text>30 mins</Text>
                    </ListItem>
                    <ListItem key={`mute-2`}>
                        <ListItem.CheckBox checked={false}/>
                        <Text>45 mins</Text>
                    </ListItem>
                    <ListItem key={`mute-3`}>
                        <ListItem.CheckBox checked={false}/>
                        <Text>1 hour</Text>
                    </ListItem>
                    <ListItem key={`mute-4`}>
                        <ListItem.CheckBox checked={false}/>
                        <Text>Until I turn it back on</Text>
                    </ListItem>
                </View>
            </View>
        </Modal>
    )
}

export default MuteNotification

