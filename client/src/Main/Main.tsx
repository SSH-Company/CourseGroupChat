import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform } from "react-native";
import { ListItem, Avatar, Header, SearchBar } from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { RenderMessageContext } from '../Util/WebSocket';
import { ChatLog } from '../Util/ChatLog';

type listtype = {
  id: number;
  message_id: number;
  name: string;
  avatar_url: string;
  subtitle: string;
  created_at: Date
};

// landing page.
const Main = ({ navigation }) => {
  // search bar.
  const [search, setSearch] = useState("");
  // data arrays.
  // const userID = useContext(UserContext);
  const { renderFlag } = useContext(RenderMessageContext);
  const [completeList, setCompleteList] = useState<listtype[]>([]);
  const [filteredList, setFilteredList] = useState<listtype[]>([]);

  useEffect(() => {
    const log = ChatLog.getChatLogInstance()
    let list = []
    Object.keys(log.chatLog).forEach(key => {
      const text = log.chatLog[key][0]
      const grpInfo = log.groupInfo[key]
      list.push({
        id: key,
        message_id: text._id,
        name: grpInfo.name,
        avatar_url: grpInfo.avatar,
        subtitle: text.text,
        created_at: text.createdAt
      })
    })
    const sortedList = list.sort((a, b) => new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf())
    setFilteredList(sortedList)
    setCompleteList(sortedList)
  }, [renderFlag])

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
        leftComponent={{ icon: "menu", color: "#734f96" }}
        centerComponent={{
          text: "Chat",
          style: { color: "#734f96", fontSize: 20, fontWeight: "bold" },
        }}
        rightComponent={
          <FontAwesome5 name={"comments"} color="#734f96" size={20} light />
        }
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
                groupID: { id: l.id, name: l.name, avatar: l.avatar_url }
              })
            }}
          >
            <Avatar rounded size="medium" source={{ uri: l.avatar_url }} />
            <ListItem.Content>
              <ListItem.Title>{l.name}</ListItem.Title>
              <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>
    </View>
  );
};
export default Main;
