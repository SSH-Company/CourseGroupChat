import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BASE_URL from './BaseUrl';
import axios from 'axios';

export default function App() {
  const [test, setTest] = useState('');

  useEffect(() => {
    axios.get(`${BASE_URL}/api/test`)
      .then(res => setTest(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <View style={styles.container}>
      <Text>{`${test}`}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
