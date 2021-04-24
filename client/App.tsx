import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import Socket from './src/Socket/WebSocket';
import Main from './src/Main/Main';
import Chat from './src/Chat/Chat';
import { LogIn, SignUp } from './src/Auth';
import { 
  CreateGroupForm, 
  Search, 
  GroupSearch 
} from './src/Search';
import { 
  Profile, 
  ProfileSettings, 
  FriendRequests
} from './src/Profile';
import {
  GroupMembers,
  FullScreenMedia,
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
                  <Stack.Screen 
                    name="Chat" 
                    component={Chat} 
                    options={{
                      transitionSpec: {
                        open: TransitionSpecs.TransitionIOSSpec,
                        close: TransitionSpecs.TransitionIOSSpec,
                      },
                    }}
                  />
                  <Stack.Screen name="FriendRequests" component={FriendRequests}/>
                  <Stack.Screen name="Profile" component={Profile}/>
                  <Stack.Screen name="ProfileSettings" component={ProfileSettings} options={{gestureDirection: 'horizontal-inverted'}}/>
                  <Stack.Screen name="GroupMembers" component={GroupMembers}/>
                  <Stack.Screen name="FullScreenMedia" component={FullScreenMedia}/>   
                  <Stack.Screen name="Gallery" component={Gallery}/>               
                  <Stack.Screen name="CreateGroupForm" component={CreateGroupForm}/>
                  <Stack.Screen name="Search" component={Search}/>
                  <Stack.Screen name="GroupSearch" component={GroupSearch}/>
                  <Stack.Screen name="SignUp" component={SignUp}/>
              </Stack.Navigator>
            </Socket>
        </NavigationContainer>
      </LogIn>
    </ActionSheetProvider>
  )
};
