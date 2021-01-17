import React, { FunctionComponent, useState, useCallback, useEffect } from 'react'
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { Message, CustomToolbar } from './components'

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

  const renderMessage = (props: any) => {
    const currentMessage = props.currentMessage
    const isCurrentUser = Object.keys(currentMessage.user).length === 0
    if (currentMessage) {
        return (
            <Message {...currentMessage} isCurrentUser={isCurrentUser}/>
        )
    }
  }

  const renderInputToolbar = (props: any) => {
    return (
      <CustomToolbar {...props} />
    )    
  }

  return (
    <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        renderMessage={props => renderMessage(props)}
        renderInputToolbar={props => renderInputToolbar(props)}
    />
  )
}

export default Chat