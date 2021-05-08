import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform, RefreshControl } from "react-native";
import { Header, SearchBar, Image } from "react-native-elements";
import { Feather, Ionicons } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from 'expo-status-bar';
import { UserContext } from '../Auth/Login';
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BaseList from '../Util/CommonComponents/BaseList';
import { THEME_COLORS } from '../Util/CommonComponents/Colors';
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

  useEffect(() => {
    if (isFocused) resetList(true);
  }, [isFocused])

  useEffect(() => {
    // chat list.
    resetList();
  }, [renderFlag]) 

  const resetList = async (fromSource: boolean = false) => {
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
            onPress={() => navigation.navigate("ProfileSettings")}
          />
        }
        centerComponent={
          <SearchBar
            platform={Platform.OS === "android" ? "android" : "ios"}
            clearIcon={{ size: 20 }}
            placeholder="Search"
            onFocus={() => navigation.navigate("GroupSearch")}
            containerStyle={{ borderRadius: 50, height: 35, justifyContent: 'center' }}
          />
        }
        rightComponent={
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Ionicons 
              name={"person-add"} 
              color={THEME_COLORS.ICON_COLOR} 
              size={20} 
              onPress={() => console.log('clicked')}
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
        containerStyle={{ marginTop: 10 }}
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
        />
      </ScrollView>
    </View>
  );
};

export default Main;
