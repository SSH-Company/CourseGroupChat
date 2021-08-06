import React, { FunctionComponent, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, Modal, StyleSheet, Button } from 'react-native';
import { ListItem } from "react-native-elements";
import { handleError } from '../../Util/CommonFunctions';
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
    isMuted: boolean,
    groupID: string,
    visible: boolean,
    onClose: (muteDate: string) => any
}

const MuteNotification:FunctionComponent<MuteNotificationProps> = (props: MuteNotificationProps) => {
    const {
        isMuted,
        groupID,
        visible,
        onClose = (muteDate: string) => {}
    } = props;

    const [checkedItem, setCheckedItem] = useState(0);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [muteDate, setMuteDate] = useState<Date>();

    useEffect(() => {
        let muteDate;

        switch (checkedItem) {
            case 4:
                muteDate = 'indefinite';
                break;
            case 5:
                muteDate = null;
                break;
            default:
                const minutesToAdd = (15 * checkedItem) + 15;
                muteDate = new Date();
                muteDate.setHours(muteDate.getHours(), muteDate.getMinutes() + minutesToAdd, 0, 0);
                break;    
        }

        setMuteDate(muteDate);
    }, [checkedItem])

    const handleSubmit = () => {
        setSendingRequest(true);

        axios.post(`${BASE_URL}/api/chat/mute`, { groupID, timestamp: muteDate })
            .then(async () => {
                //reset the group information
                onClose(muteDate?.toString() || '');
            })
            .catch(err => {
                console.log(err)
                handleError(err)
            })
            .finally(() => setSendingRequest(false))
    }
    
    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={() => onClose(muteDate?.toString() || '')}
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
                    {isMuted && <ListItem key={`mute-${5}-${checkedItem}`}>
                        <ListItem.CheckBox 
                            checked={checkedItem === 5}
                            onPress={() => setCheckedItem(5)}
                        />
                        <Text>Unmute</Text>
                    </ListItem>}
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

