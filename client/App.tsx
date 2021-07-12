import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import Socket from './src/Util/WebSocket';
import Main from './src/Main/Main';
import Chat from './src/Chat/Chat';
import { LogIn } from './src/Auth';
import { 
  Search, 
  GroupSearch,
  CourseSearch,
  FriendSearch 
} from './src/Search';
import { 
  Profile, 
  Settings, 
  FriendRequests,
  CourseGroups,
  IgnoredGroups,
  EditProfile,
  CommonCourseGroups,
  MutualFriends,
  ContactUs,
  Friends
} from './src/Profile';
import {
  GroupMembers,
  Gallery
} from './src/Chat/components';
import { navigationRef } from './src/Util/RootNavigation';

export default function App() {
  const Stack = createStackNavigator()

  return (
    <ActionSheetProvider>
      <LogIn>
        <NavigationContainer ref={navigationRef}>
            <Socket>
              <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false, cardStyle: { backgroundColor: 'white' }}}>
                  <Stack.Screen name="Main" component={Main}/>
                  <Stack.Screen name="Chat" component={Chat}/>
                  <Stack.Screen name="Friends" component={Friends}/>
                  <Stack.Screen name="FriendRequests" component={FriendRequests}/>
                  <Stack.Screen name="CourseGroups" component={CourseGroups}/>
                  <Stack.Screen name="ContactUs" component={ContactUs}/>
                  <Stack.Screen name="IgnoredGroups" component={IgnoredGroups}/>
                  <Stack.Screen name="EditProfile" component={EditProfile}/>
                  <Stack.Screen name="Profile" component={Profile}/>
                  <Stack.Screen name="CommonCourseGroups" component={CommonCourseGroups}/>
                  <Stack.Screen name="MutualFriends" component={MutualFriends}/>
                  <Stack.Screen name="Settings" component={Settings} options={{gestureDirection: 'horizontal-inverted'}}/>
                  <Stack.Screen name="GroupMembers" component={GroupMembers}/> 
                  <Stack.Screen name="Gallery" component={Gallery}/>
                  <Stack.Screen name="Search" component={Search}/>
                  <Stack.Screen name="GroupSearch" component={GroupSearch}/>
                  <Stack.Screen name="CourseSearch" component={CourseSearch}/>
                  <Stack.Screen name="FriendSearch" component={FriendSearch}/>
              </Stack.Navigator>
            </Socket>
        </NavigationContainer>
      </LogIn>
    </ActionSheetProvider>
  )
};
