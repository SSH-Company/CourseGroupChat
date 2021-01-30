import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, Platform } from "react-native";
import { IMessage } from 'react-native-gifted-chat';
import { ListItem, Avatar, Header, SearchBar } from "react-native-elements";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { UserContext } from '../Auth/Login';
import { Socket } from '../Util/WebSocket';
import { exampleList } from "./exampleList";

type RecipientMessageMapType = {
  [key: number]: IMessage[]
}

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
  const userID = useContext(UserContext);
  const [filteredList, setFilteredList] = useState<listtype[]>(exampleList);
  const [recipientMessageMap, setRecipientMessageMap] = useState<RecipientMessageMapType>({});

  //Create recipient id -> IMessage[] map
  useEffect(() => {
    let map = {} as RecipientMessageMapType
    exampleList.map(row => {
      const newMessage = [{
        _id: row.message_id,
        text: row.subtitle,
        createdAt: row.created_at,
        user: {
          _id: row.id,
          name: row.name,
          avatar: row.avatar_url
        }
      }]
      map[row.id] = newMessage
    })
    setRecipientMessageMap(map)
  }, [exampleList])

  useEffect(() => {
      websocketConnect()
  }, [])

  //WebSocket connection
  const websocketConnect = () => {
    const socket = Socket.getSocket(userID).socket;

    socket.onmessage = (e: any) => {
      const data = JSON.parse(e.data)
      console.log(data)
      const newMessage:any = [{
          _id: data._id,
          text: data.text,
          createdAt: new Date(),
          user: {
              _id: data.recipientID.id,
              name: data.recipientID.name,
              avatar: data.recipientID.avatar
          }
      }]
      setRecipientMessageMap(oldMap => {
        const newMap = oldMap;
        newMap[data.recipientID.id] = newMessage.concat(oldMap[data.recipientID.id])
        return newMap
      })
    }

    return () => { socket.close() }
  }


  const searchFunction = (input) => {
    if (input) {
      const newList = exampleList.filter((item) => {
        const itemInfo = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const inputInfo = input.toUpperCase();
        return itemInfo.indexOf(inputInfo) > -1;
      });
      setFilteredList(newList);
      setSearch(input);
    } else {
      setFilteredList(exampleList);
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
            topDivider
            bottomDivider
            onPress={() => {
              navigation.navigate("Chat", {
                recipientID: { id: l.id, name: l.name, avatar: l.avatar_url },
                queuedMessages: JSON.stringify(recipientMessageMap[l.id])
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
