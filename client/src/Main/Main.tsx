import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform, RefreshControl } from "react-native";
import { Header, SearchBar } from "react-native-elements";
import { Feather, FontAwesome } from "react-native-vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import BaseList from '../Util/CommonComponents/BaseList';

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
  const { renderFlag } = useContext(RenderMessageContext);
  const [completeList, setCompleteList] = useState<listtype[]>([]);
  const [refreshing, setRefreshing] = useState(false); 
  const isFocused = useIsFocused();

  useEffect(() => {
    // chat list.
    resetList();
  }, [renderFlag, isFocused]) 

  const resetList = async (fromSource: boolean = false) => {
    setRefreshing(fromSource);
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
    setCompleteList(list);
    setRefreshing(false);
  }

  // renders header | searchbar | chat list
  return (
    <View style={{ flex: 1 }}>
      <Header
        placement="center"
        backgroundColor="#ccccff"
        leftComponent={
          <FontAwesome
            name={"bars"}
            color="#734f96" 
            size={25}
            onPress={() => navigation.navigate("Profile")}  // TODO: change slide scroll from left to right
          />
        }
        centerComponent={{
          text: "Chat",
          style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
        }}
        rightComponent={
          <Feather 
            name={"edit"} 
            color="#734f96" 
            size={25} 
            onPress={() => navigation.navigate("CreateGroupForm")}
          />
        }
      />
      <ScrollView
        contentOffset={{ x: 0, y: 76 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => resetList(true)}/>
        }
      >
        <SearchBar
          platform={Platform.OS === "android" ? "android" : "ios"}
          clearIcon={{ size: 30 }}
          placeholder="Search groups"
          onFocus={() => navigation.navigate("GroupSearch")}
        />
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
