import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform, RefreshControl } from "react-native";
import { Header, SearchBar, Image } from "react-native-elements";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useActionSheet } from '@expo/react-native-action-sheet';
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BaseList from '../Util/CommonComponents/BaseList';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
import { handleLeaveGroup } from '../Util/CommonFunctions';
import { EMPTY_IMAGE_DIRECTORY } from '../BaseUrl';

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
  const isFocused = useIsFocused();
  const { showActionSheetWithOptions } = useActionSheet();

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
                console.log('mute');
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
      <StatusBar style="light" backgroundColor={THEME_COLORS.STATUS_BAR}/>
      <Header
        placement="left"
        backgroundColor={THEME_COLORS.HEADER}
        leftComponent={
          <Image
            source={{ uri: user.avatar as string || EMPTY_IMAGE_DIRECTORY }}
            style={{ width: 30, height: 30, borderRadius: 200 }}
            onPress={() => navigation.navigate("Settings")}
          />
        }
        centerComponent={
          <SearchBar
            platform={Platform.OS === "android" ? "android" : "ios"}
            clearIcon={{ size: 20 }}
            placeholder="Search"
            onFocus={() => navigation.navigate("GroupSearch")}
            containerStyle={{ borderRadius: 50, height: 35, justifyContent: 'center', backgroundColor: 'white' }}
          />
        }
        rightComponent={
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Ionicons 
              name={"person-add"} 
              color={THEME_COLORS.ICON_COLOR} 
              size={20} 
              onPress={() => navigation.navigate("FriendSearch")}
            />
            <Feather 
              name={"edit"} 
              color={THEME_COLORS.ICON_COLOR} 
              size={20} 
              onPress={() => navigation.navigate("Search", { groupName: "New group", searchType: "create" })}
              style={{ marginLeft: 20 }}
            />
          </View>
        }
        leftContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
        rightContainerStyle={{ alignContent: 'center', justifyContent: 'center' }}
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
        <BaseList
            items={completeList}
            itemOnPress={(l, i) => {
                navigation.navigate("Chat", { groupID: l.id })
            }}
            itemOnLongPress={(l, i) => handleLongPress(l.id)}
        />
      </ScrollView>
    </View>
  );
};

export default Main;
