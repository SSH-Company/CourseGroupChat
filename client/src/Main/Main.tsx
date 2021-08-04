import React, { useState, useEffect, useContext } from "react";
import { Alert, Text, View, ScrollView, Platform, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { Header, SearchBar, Image } from "react-native-elements";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { MuteNotification } from '../Chat/components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Util/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BaseList from '../Util/CommonComponents/BaseList';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleLeaveGroup, handleIgnoreGroup } from '../Util/CommonFunctions';
import { EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

const styles = StyleSheet.create({
    touchable: {}
})

export type listtype = {
  id: string;
  message_id: string;
  name: string;
  avatar_url: string;
  subtitle: string;
  createdAt?: Date,
  verified: 'Y' | 'N';
};

// landing page.
const Main = ({ navigation }) => {
  // data arrays.
  const { user } = useContext(UserContext);
  const { renderFlag } = useContext(RenderMessageContext);
  const [completeList, setCompleteList] = useState<listtype[]>([]);
  const [refreshing, setRefreshing] = useState(false); 
  const isFocused = useIsFocused();
  const { showActionSheetWithOptions } = useActionSheet();
  const [muteNotificationsModal, setMuteNotificationsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>();

  useEffect(() => {
    if (isFocused) resetList(true);
  }, [isFocused])

  useEffect(() => {
    // chat list.
    resetList();
  }, [renderFlag]) 

  const resetList = async (fromSource: boolean = false) => {
	let mounted = true;
	if (mounted) {
		const log = await ChatLog.getChatLogInstance(fromSource);
		let list = [];
		if (log) {
			Object.keys(log.chatLog).forEach(key => {
                const text = log.chatLog[key][0];
                const grpInfo = log.groupInfo[key];
                list.push({
                    id: key,
                    message_id: text._id,
                    name: grpInfo.name,
                    avatar_url: grpInfo.avatar,
                    subtitle: text.subtitle || text.text,
                    createdAt: text.createdAt,
                    verified: grpInfo.verified,
                    member_count: grpInfo.member_count
                });
            });
            setCompleteList(list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
            setRefreshing(false);
		}
	}

	return () => { mounted = false; }
  }

  const alertUser = (groupID: string) => {
      Alert.alert(
          "Ignore this conversation?",
          `You won't be notified when someone sends a message to this group, and the conversation will move to Spam. We won't tell other members of the group they are being ignored.`,
          [{ text: "CANCEL", onPress: () =>  console.log('cancelled') },
          { text: "IGNORE", onPress: () => handleIgnoreGroup(groupID, () => resetList(true)) }]
      )
  }

  const handleLongPress = (groupID: string) => {
    const options = ['Mute Notifications', 'Ignore messages', 'Leave Group'];
    const icons = [
      <FontAwesome5 
          name={"volume-mute"} 
          color={THEME_COLORS.ICON_COLOR} 
          size={20}
      />,
      <MaterialCommunityIcons 
          name={"cancel"} 
          color={THEME_COLORS.ICON_COLOR} 
          size={20}
        />,
      <Ionicons 
          name={"exit-outline"} 
          color={THEME_COLORS.ICON_COLOR} 
          size={20}
      />
    ];
    const cancelButtonIndex = 3;
    showActionSheetWithOptions({
        options,
        icons,
        cancelButtonIndex
    }, async (buttonIndex) => {
        switch (buttonIndex) {
            case 0:
                setSelectedGroup(groupID);
                setMuteNotificationsModal(true);
                break;
            case 1:
                alertUser(groupID);
                break;
            case 2:
                handleLeaveGroup([], groupID, true, () => resetList(true));
                break;
            default:
                break;
        }
    });
  }

  // renders header | searchbar | chat list
  return ( 
    <View style={{ flex: 1 }}>
        <Header
            placement="left"
            backgroundColor={THEME_COLORS.HEADER}
            statusBarProps={{ backgroundColor: THEME_COLORS.STATUS_BAR }}
            containerStyle={{ minHeight: 100 }}
            leftComponent={
                <TouchableOpacity 
                    activeOpacity={1}
                    style={styles.touchable}
                    hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}
                >
                    <Image
                        source={{ uri: user.avatar as string || EMPTY_IMAGE_DIRECTORY }}
                        style={{ width: 40, height: 40, borderRadius: 200 }}
                        onPress={() => navigation.navigate("Settings")}
                    />
                </TouchableOpacity>
            }
            centerComponent={
            <SearchBar
                platform={"android"}
                placeholder="Search"
                onFocus={() => navigation.navigate("GroupSearch")}
                containerStyle={{ borderRadius: 50, height: 35, justifyContent: 'center', backgroundColor: 'white' }}
            />
            }
            rightComponent={
                <TouchableOpacity 
                    hitSlop={{top: 50, bottom: 50, left: 50, right: 50}}
                    style={[styles.touchable, { display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingRight: 5 }]}
                >
                    <Feather 
                        name={"edit"} 
                        color={THEME_COLORS.ICON_COLOR} 
                        size={20}
                        onPress={() => navigation.navigate("Search", { groupName: "New group", searchType: "create" })} 
                    />
                </TouchableOpacity>
            }
            leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            centerContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
            rightContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
        />
        <MuteNotification
            groupID={selectedGroup}
            visible={muteNotificationsModal}
            onClose={() => setMuteNotificationsModal(false)}
        />
        {completeList.length > 0 ?
            <ScrollView
                contentOffset={{ x: 0, y: 76 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl 
                        tintColor={Platform.OS === "ios" ? 'transparent' : null}
                        refreshing={refreshing} 
                        onRefresh={() => {
                            setRefreshing(true);
                            resetList(true);
                        }}
                    />
                }
            >
                <BaseList
                    items={completeList}
                    itemOnPress={(l, i) => {
                        navigation.navigate("Chat", { groupID: l.id })
                    }}
                    itemOnLongPress={(l, i) => handleLongPress(l.id)}
                    topDivider
                />
            </ScrollView>
            :
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{ color: "black", fontSize: 25, padding: 10, textAlign: 'center' }}>No Messages</Text>
                <Text style={{ color: "black", fontSize: 18, padding: 10, textAlign: 'center' }}>New messages will appear here</Text>
            </View>
        }
      {/* <View style={styles.sendMessageStyle}>
            <Button
              icon={
                <Feather 
                  name={"edit"} 
                  color={THEME_COLORS.ICON_COLOR} 
                  size={25} 
                />
              }
              buttonStyle={{ width: 60, 
                height: 60, 
                borderRadius: 200, 
                backgroundColor: THEME_COLORS.HEADER,
                shadowOffset:{  width: 10,  height: 10,  },
                shadowColor: 'black',
                shadowOpacity: 1.0,
              }}
              onPress={() => navigation.navigate("Search", { groupName: "New group", searchType: "create" })}
            />
      </View> */}
    </View>
  );
};

export default Main;
