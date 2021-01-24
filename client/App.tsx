import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './src/Main/Main';
import Chat from './src/Chat/Chat';
import Settings from './src/Settings/Settings';

export default function App() {
  const Stack = createStackNavigator()

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Main" component={Main}/>
        <Stack.Screen name="Chat" component={Chat}/>
        <Stack.Screen name="Settings" component={Settings}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
};
