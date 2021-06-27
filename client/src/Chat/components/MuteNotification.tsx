import React, { FunctionComponent, useState, useEffect } from 'react';
import { ActivityIndicator, Text, View, Modal, StyleSheet, Button } from 'react-native';
import { ListItem } from "react-native-elements";
import { ChatLog } from '../../Util/ChatLog';
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
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (groupID) updateMuted(groupID);
    }, [groupID])

    const updateMuted = async (groupID) => {
        const log = await ChatLog.getChatLogInstance();
        const groupInfo = log.groupInfo[groupID];
        if (groupInfo && groupInfo.hasOwnProperty('mute')) {
            setIsMuted(groupInfo?.mute === 'indefinite' || (groupInfo?.mute !== null && new Date() < new Date(groupInfo?.mute)));
        } else setIsMuted(true);
    }

    const handleSubmit = () => {
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

        setSendingRequest(true);

        axios.post(`${BASE_URL}/api/chat/mute`, { groupID, timestamp: muteDate })
            .then(async () => {
                //reset the group information
                await ChatLog.getChatLogInstance(true);
                onClose();
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

