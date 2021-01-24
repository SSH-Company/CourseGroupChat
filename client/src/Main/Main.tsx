import React from 'react';
import { View, ScrollView, Platform, Dimensions } from 'react-native';
import { ListItem, Avatar, Header, SearchBar } from 'react-native-elements';
import { FontAwesome5, Entypo } from 'react-native-vector-icons';
import { DrawerLayout } from 'react-native-gesture-handler';
import { exampleList } from './exampleList';
import Settings from '../Settings/Settings';

type listtype = {
  name: string,
  avatar_url: string,
  subtitle: string
}

// landing page.
const Main = ({ navigation }) => {
  // search bar.
  const [search, setSearch] = React.useState('');
  // data arrays.
  const [filteredList, setFilteredList] = React.useState<listtype[]>(exampleList);
  const [fullList, setFullList] = React.useState<listtype[]>(exampleList);

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
      <DrawerLayout
        drawerWidth={Dimensions.get('window').width}
        drawerPosition={'left'}
        drawerType={'front'}
        drawerBackgroundColor="#ffffff"
        renderNavigationView={Settings}
        contentContainerStyle={{}}
      >
        <Header
          placement="center"
          backgroundColor="#ccccff"
          leftComponent={<FontAwesome5 name={'bars'} onPress={()=>navigation.navigate('Settings')} color='#734f96' size={22} solid/>}
          centerComponent={{ text: 'Chat', style: { color: '#734f96', fontSize: 20, fontWeight: 'bold' }}}
          rightComponent= {<Entypo name={'new-message'} color='#734f96' size={20} light/>}
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
              <ListItem key={i} topDivider bottomDivider onPress={() => navigation.navigate('Chat')}>
                <Avatar rounded size="medium" source={{uri: l.avatar_url}} />
                <ListItem.Content>
                  <ListItem.Title>{l.name}</ListItem.Title>
                  <ListItem.Subtitle>{l.subtitle}</ListItem.Subtitle>
                </ListItem.Content>
              </ListItem>
            ))
          }
        </ScrollView>
      </DrawerLayout>
    </View>
  );
};
export default Main;