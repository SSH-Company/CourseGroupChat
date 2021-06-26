import React, { FunctionComponent, useState } from 'react';
import { ActivityIndicator, Text, View, Modal, StyleSheet, Button } from 'react-native';
import { ListItem } from "react-native-elements";
import { BASE_URL } from '../../BaseUrl';
import axios from 'axios';

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    }
})

type MuteNotificationProps = {
    groupID: string,
    visible: boolean,
    onClose: () => any
}

const MuteNotification:FunctionComponent<MuteNotificationProps> = (props: MuteNotificationProps) => {
    const {
        groupID,
        visible,
        onClose = () => {}
    } = props;

    const [checkedItem, setCheckedItem] = useState(0);
    const [sendingRequest, setSendingRequest] = useState(false);

    const handleSubmit = () => {
        let muteDate;

        if (checkedItem === 4) {
            //max date
            muteDate = 'indefinite';
        } else {
            const minutesToAdd = (15 * checkedItem) + 15;
            muteDate = new Date();
            muteDate.setHours(muteDate.getHours(), muteDate.getMinutes() + minutesToAdd, 0, 0);
        }

        setSendingRequest(true);

        axios.post(`${BASE_URL}/api/chat/mute`, { groupID, timestamp: muteDate })
            .then(() => onClose())
            .catch(err => {
                console.log(err)
            })
            .finally(() => setSendingRequest(false))
    }
    
    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <Text style={{ fontSize: 25, fontWeight: 'bold' }}>Mute for...</Text>
                <View>
                    {['15 mins', '30 mins', '45 mins', '1 hour', 'Until I turn it back on'].map((l, i) => (
                        <ListItem key={`mute-${i}-${checkedItem}`}>
                            <ListItem.CheckBox 
                                checked={i === checkedItem}
                                onPress={() => setCheckedItem(i)}
                            />
                            <Text>{l}</Text>
                        </ListItem>
                    ))}
                    {sendingRequest ?
                        <ActivityIndicator />
                        :
                        <Button title="OK" onPress={handleSubmit} />
                    }
                </View>
            </View>
        </Modal>
    )
}

export default MuteNotification

