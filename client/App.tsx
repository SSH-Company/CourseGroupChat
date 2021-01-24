import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './src/Main/Main'
import Chat from './src/Chat/Chat'
import { LogIn, SignIn } from './src/Auth'

export default function App() {
  const Stack = createStackNavigator()

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogIn" screenOptions={{headerShown: false}}>
        <Stack.Screen name="LogIn" component={LogIn}/>
        <Stack.Screen name="SignIn" component={SignIn}/>
        <Stack.Screen name="Main" component={Main}/>
        <Stack.Screen name="Chat" component={Chat}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
};
