import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform } from "react-native";
import { ListItem, Avatar, Header, SearchBar } from "react-native-elements";
import Feather from "react-native-vector-icons/Feather";

// file imports.
import { RenderMessageContext } from '../Socket/WebSocket';
import { ChatLog } from '../Util/ChatLog';
import VerifiedIcon from '../Util/VerifiedIcon';
import * as Notifications from 'expo-notifications';
import {Button} from 'react-native';

export type listtype = {
  id: number;
  message_id: number;
  name: string;
  avatar_url: string;
  subtitle: string;
  created_at: Date,
  verified: 'Y' | 'N';
};

// landing page.
const Main = ({ navigation }) => {
  // search bar.
  const [search, setSearch] = useState("");
  // data arrays.
  const { renderFlag } = useContext(RenderMessageContext);
  const [completeList, setCompleteList] = useState<listtype[]>([]);
  const [filteredList, setFilteredList] = useState<listtype[]>([]);

  useEffect(() => {
    // chat list.
    resetList();
  }, [renderFlag]) 

  const resetList = async () => {
    const log = await ChatLog.getChatLogInstance()
    let list = []
    Object.keys(log.chatLog).forEach(key => {
      const text = log.chatLog[key][0]
      const grpInfo = log.groupInfo[key]
      list.push({
        id: key,
        message_id: text._id,
        name: grpInfo.name,
        avatar_url: grpInfo.avatar,
        subtitle: text.subtitle || text.text,
        created_at: text.createdAt,
        verified: grpInfo.verified
      })
    })
    const sortedList = list.sort((a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf())
    setFilteredList(sortedList)
    setCompleteList(sortedList)
  }

  const searchFunction = (input) => {
    if (input) {
      const newList = completeList.filter((item) => {
        const itemInfo = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const inputInfo = input.toUpperCase();
        return itemInfo.indexOf(inputInfo) > -1;
      });
      setFilteredList(newList);
      setSearch(input);
    } else {
      setFilteredList(completeList);
      setSearch(input);
    }
  };

  // renders header | searchbar | chat list
  return (
    <View style={{ flex: 1 }}>
      <Header
        placement="center"
        backgroundColor="#ccccff"
        leftComponent={{ icon: "menu", color: "#734f96", size: 25 }}
        centerComponent={{
          text: "Chat",
          style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
        }}
        rightComponent={
          <Feather 
            name={"edit"} 
            color="#734f96" 
            size={25} 
            onPress={() => navigation.navigate("CreateGroupForm")} //TODO: change back to CreateGroupForm
          />
        }
      />
      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
      <ScrollView
        contentOffset={{ x: 0, y: 76 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar
          platform={Platform.OS === "android" ? "android" : "ios"}
          clearIcon={{ size: 30 }}
          placeholder="Search messages"
          onChangeText={(text) => searchFunction(text)}
          onCancel={() => searchFunction("")}
          value={search}
        />
        {filteredList.map((l, i) => (
          <ListItem
            key={i}
            onPress={() => {
              navigation.navigate("Chat", {
                groupID: { 
                  id: l.id, 
                  name: l.name, 
                  avatar: l.avatar_url, 
                  verified: l.verified
                }
              })
            }}
          >
            <Avatar rounded size="medium" source={{ uri: l.avatar_url }}/>
            <ListItem.Content>
              <View style={{ display:'flex', flexDirection: "row", justifyContent: "space-between" }}>
                <ListItem.Title>{`${l.name}`}</ListItem.Title>
                {l.verified === 'Y' && <VerifiedIcon style={{ marginLeft: 8 }}/>}
              </View>
              <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>
    </View>
  );
};

// test notifications.
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

export default Main;
