import React from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { ListItem, Avatar, Header, SearchBar } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { exampleList } from './exampleList';

type exam = {
  name: string,
  avatar_url: string,
  subtitle: string
}

// landing page.
const Main = ({ navigation }) => {
  // search bar.
  const [search, setSearch] = React.useState('');
  // data arrays.
  const [filteredList, setFilteredList] = React.useState<exam[]>(exampleList);
  const [fullList, setFullList] = React.useState<exam[]>(exampleList);

  const searchFunction = (input) => {
    if (input) {
      const newList = fullList.filter((item) => {
        const itemInfo = item.name
        ? item.name.toUpperCase()
        : ''.toUpperCase();
        const inputInfo = input.toUpperCase();
        return itemInfo.indexOf(inputInfo) > -1;
      });
      setFilteredList(newList);
      setSearch(input);
    }
    else {
      setFilteredList(fullList);
      setSearch(input);
    }
  }

  // renders header | searchbar | chat list
  return (
    <View style={{flex:1}}>
      <Header
        placement="center"
        backgroundColor="#ccccff"
        leftComponent={{ icon: 'menu', color: '#734f96' }}
        centerComponent={{ text: 'Chat', style: { color: '#734f96', fontSize: 20, fontWeight: 'bold' }}}
        rightComponent= {<FontAwesome5 name={'comments'} color='#734f96' size={20} light/>}
      />
      <ScrollView contentOffset={{x: 0, y: 76}} keyboardShouldPersistTaps="handled">
      <SearchBar
        platform={Platform.OS === 'android' ? 'android' : 'ios'}
        clearIcon={{size: 30}}
        placeholder="Search messages"
        onChangeText={(text) => searchFunction(text)}
        onCancel={() => searchFunction('')}
        value={search}
      />  
        {
          filteredList.map((l, i) => (
            <ListItem key={i} bottomDivider onPress={() => navigation.navigate('Chat')}>
              <Avatar rounded size="medium" source={{uri: l.avatar_url}} />
              <ListItem.Content>
                <ListItem.Title>{l.name}</ListItem.Title>
                <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </ScrollView>
    </View>
  );
};
export default Main;