import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import Socket from './src/Socket/WebSocket';
import Main from './src/Main/Main';
import Chat from './src/Chat/Chat';
import { LogIn } from './src/Auth';
import { 
  CreateGroupForm, 
  Search, 
  GroupSearch 
} from './src/Search';
import { navigationRef } from './src/Util/RootNavigation';

export default function App() {
  const Stack = createStackNavigator()

  return (
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
                  <Stack.Screen name="CreateGroupForm" component={CreateGroupForm}/>
                  <Stack.Screen name="Search" component={Search}/>
                  <Stack.Screen name="GroupSearch" component={GroupSearch}/>
              </Stack.Navigator>
            </Socket>
        </NavigationContainer>
      </LogIn>
  )
};
