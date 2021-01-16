import React, { FunctionComponent, useState, useCallback, useEffect } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import Message from './components/Message'

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

  const renderMessage = (message: any) => {
    const currentMessage = message.currentMessage
    const isCurrentUser = Object.keys(currentMessage.user).length === 0
    if (currentMessage) {
        return (
            <Message {...message.currentMessage} isCurrentUser={isCurrentUser}/>
        )
    }
  }

  return (
    <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderMessage={message => renderMessage(message)}
    />
  )
}

export default Chat