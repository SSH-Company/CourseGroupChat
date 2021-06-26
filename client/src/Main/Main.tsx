import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform, RefreshControl } from "react-native";
import { Header, SearchBar, Image, ListItem, Button } from "react-native-elements";
import { AntDesign, Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { MuteNotification } from '../Chat/components';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BaseList from '../Util/CommonComponents/BaseList';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleLeaveGroup } from '../Util/CommonFunctions';
import { EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';
import { BASE_URL } from '../BaseUrl';
import Swipeable from 'react-native-swipeable';
import axios from 'axios';

export type listtype = {
  id: string;
  message_id: string;
  name: string;
  avatar_url: string;
  subtitle: string;
  created_at?: Date,
  verified: 'Y' | 'N';
};

// landing page.
const Main = ({ navigation }) => {
  // data arrays.
  const { user } = useContext(UserContext);
  const { renderFlag } = useContext(RenderMessageContext);
  const [completeList, setCompleteList] = useState<listtype[]>([]);
  const [refreshing, setRefreshing] = useState(false); 
  const [friendBar, setFriendBar] = useState(false);
  const isFocused = useIsFocused();
  const { showActionSheetWithOptions } = useActionSheet();
  const [muteNotificationsModal, setMuteNotificationsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState();

  useEffect(() => {
    if (isFocused) resetList(true);
  }, [isFocused])

  useEffect(() => {
    // chat list.
    resetList();
  }, [renderFlag]) 

  useEffect(() => {
    axios.get(`${BASE_URL}/api/profile/friend-request`)
      .then(res => {
        if (res.data.length > 0) {
          setFriendBar(true);
        }
        else {
          setFriendBar(false);
        }
      })
  }, [])

  const resetList = async (fromSource: boolean = false) => {
    let mounted = true;
    if (mounted) {
      const log = await ChatLog.getChatLogInstance(fromSource);
      let list = [];
      Object.keys(log.chatLog).forEach(key => {
        const text = log.chatLog[key][0];
        const grpInfo = log.groupInfo[key];
        list.push({
          id: key,
          message_id: text._id,
          name: grpInfo.name,
          avatar_url: grpInfo.avatar,
          subtitle: text.subtitle || text.text,
          created_at: text.createdAt,
          verified: grpInfo.verified
        });
      });
      setCompleteList(list.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
      setRefreshing(false);
    }

    return () => { mounted = false; }
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
    const cancelButtonIndex = options.length - 1;
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
                console.log('ignore');
                break;
            case 2:
                handleLeaveGroup([], groupID, true, () => resetList(true));
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
          <View>
            <Image
              source={{ uri: user.avatar as string || EMPTY_IMAGE_DIRECTORY }}
              style={{ width: 40, height: 40, borderRadius: 200 }}
              onPress={() => navigation.navigate("Settings")}
            />
          </View>
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
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingRight: 5 }}>
            <Ionicons 
              name={"person-add"} 
              color={THEME_COLORS.ICON_COLOR} 
              size={20} 
              onPress={() => navigation.navigate("FriendSearch")}
            />
          </View>
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
          {friendBar &&
          <Swipeable
            key={`swipeable-${friendBar}`}
            rightContent = {
              <Button
                icon={
                  <AntDesign
                    name="delete"
                    size={35}
                    color="white"
                  />
                }
                iconRight
                // title="Button with icon component"
              />}  
            onRightActionRelease = {() => setFriendBar(false)}
            rightActionActivationDistance = {275}
          >
            <ListItem
              key={`friendBar-${friendBar}`}
              onPress={() => navigation.navigate("FriendRequests")}
              topDivider={false}
            >
              <AntDesign
                name={"exclamationcircleo"} 
                color={THEME_COLORS.ICON_COLOR} 
                size={20}
              />
              <ListItem.Content>
                  <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                      <ListItem.Title>You have a new friend request!</ListItem.Title>
                  </View>
              </ListItem.Content>
              <ListItem.Chevron size={25}/>
            </ListItem>
          </Swipeable>}
          <BaseList
              items={completeList}
              itemOnPress={(l, i) => {
                  navigation.navigate("Chat", { groupID: l.id })
              }}
              itemOnLongPress={(l, i) => handleLongPress(l.id)}
              topDivider
            />
      </ScrollView>
      <View style={{ alignSelf: 'flex-end', justifyContent: 'flex-end', paddingRight: 35, paddingBottom: 35 }}>
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
      </View>
    </View>
  );
};

export default Main;
