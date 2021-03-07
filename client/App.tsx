import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Socket from './src/Socket/WebSocket';
import Main from './src/Main/Main'
import Chat from './src/Chat/Chat'
import { CreateGroupForm, Search } from './src/Search'
import { LogIn, SignUp } from './src/Auth'

export default function App() {
  const Stack = createStackNavigator()

  return (
      <LogIn>
        <NavigationContainer>
            <Socket>
              <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false, cardStyle: { backgroundColor: 'white' }}}>
                  <Stack.Screen name="Main" component={Main}/>
                  <Stack.Screen name="Chat" component={Chat}/>
                  <Stack.Screen name="CreateGroupForm" component={CreateGroupForm}/>
                  <Stack.Screen name="Search" component={Search}/>
              </Stack.Navigator>
            </Socket>
        </NavigationContainer>
      </LogIn>
  )
};
