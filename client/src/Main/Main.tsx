import React, { FunctionComponent } from 'react';
import { View, ScrollView } from 'react-native';
import { ListItem, Avatar, Header, SearchBar, Text } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { exampleList } from './exampleList';

// landing page.
const Main = () => {
  // search bar.
  const [search, setSearch] = React.useState('')

  return (
    <View>
      <Header
        placement="center"
        backgroundColor="#ccccff"
        leftComponent={{ icon: 'menu', color: '#734f96' }}
        centerComponent={{ text: 'Chat', style: { color: '#734f96', fontSize: 20, fontWeight: 'bold' }}}
        rightComponent= {<FontAwesome5 name={'comments'} color='#734f96' size={20} light/>}
      />
      <ScrollView>
      <SearchBar
        platform="ios"
        placeholder="Search messages"
        onChangeText={() => setSearch(search)}
        value={search}
      />
      {
        exampleList.map((l, i) => (
          <ListItem key={i} bottomDivider>
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