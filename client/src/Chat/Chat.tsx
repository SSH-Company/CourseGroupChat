import React, { FunctionComponent, useState, useCallback, useEffect } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { CustomMessage, CustomToolbar } from './components'

const Chat:FunctionComponent = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/138/any',
        },
      },
    ])
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
  }, [])

  return (
    <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderMessage={props => { return ( <CustomMessage {...props} /> ) }}
        renderInputToolbar={props => { return ( <CustomToolbar {...props} /> ) }}
    />
  )
}

export default Chat


