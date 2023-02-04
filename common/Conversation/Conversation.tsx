import React, { useCallback, useEffect, useState } from 'react'
import { MessagesList, MessageComposer } from './'
import { useAppStore } from '../../store/app'
import useGetMessages from '../../hooks/useGetMessages'
import useSendMessage from '../../hooks/useSendMessage'
import { getConversationKey } from '../../helpers'
import LoaderX from '../Loader'

type ConversationProps = {
  recipientWalletAddr: string
}

const Conversation = ({
  recipientWalletAddr,
}: ConversationProps): JSX.Element => {
  const client = useAppStore((state) => state.client) 
  const conversations = useAppStore((state) => state.conversations)
  const setConversations = useAppStore((state) => state.setConversations)
  console.log("🚀 ~ file: Conversation.tsx:18 ~ conversations", conversations)
  const selectedConversation = conversations.get(recipientWalletAddr)
  console.log("🚀 ~ file: Conversation.tsx:22 ~ selectedConversation", selectedConversation)
  const conversationKey = getConversationKey(selectedConversation)
  console.log("🚀 ~ file: Conversation.tsx:19 ~ conversationKey", conversationKey)

  const iterator1 = conversations.keys();
  const key = iterator1.next().value
  console.log("🚀 ~ file: Conversation.tsx:26 ~ key", key)
  const { sendMessage } = useSendMessage(selectedConversation)

  const [endTime, setEndTime] = useState<Map<string, Date>>(new Map())

  const { convoMessages: messages, hasMore } = useGetMessages(
    key,
    endTime.get(key)
  )

  // const name = await lookupAddress(recipientWalletAddress)
  const getMessages = async (address: string) => {
    if (address) {
   
      const conversation = await client?.conversations.newConversation(
        address
      )
      console.log("🚀 ~ file: Conversation.tsx:44 ~ getMessages ~ conversation", conversation)
      if (conversation) {
        conversations.set(address, conversation)
        setConversations(new Map(conversations))
      }
    }
  }
  useEffect(() => {
    (async () => {
      await getMessages(recipientWalletAddr)
    })()
  }, [recipientWalletAddr]);
  useEffect(() => {
    console.log('messages', messages)
  }, [messages]);
  const loadingConversations = useAppStore(
    (state) => state.loadingConversations
  )

  const fetchNextMessages = useCallback(() => {
    debugger
    console.log('messages :>>', messages)
    if (
      hasMore &&
      Array.isArray(messages) &&
      messages.length > 0 &&
      conversationKey) {
      const lastMsgDate = messages[messages.length - 1].sent
      const currentEndTime = endTime.get(conversationKey)
      if (!currentEndTime || lastMsgDate <= currentEndTime) {
        endTime.set(conversationKey, lastMsgDate)
        setEndTime(new Map(endTime))
      }
    }
  }, [conversationKey, hasMore, messages, endTime])

  const hasMessages = Number(messages?.length ?? 0) > 0

  if (loadingConversations && !hasMessages) {
    return (
      <LoaderX
        headingText="Loading messages..."
        subHeadingText="Please wait a moment"
        isLoading
      />
    )
  }

  return (
    <>

      <div className="bg-white h-[calc(100vh-7rem)] px-2">
        <MessageComposer onSend={sendMessage} />
        <div className="h-full flex justify-between flex-col">
          <MessagesList
            fetchNextMessages={fetchNextMessages}
            messages={messages ?? []}
            hasMore={hasMore}
          />
        </div>
      </div>

    </>
  )
}

export default React.memo(Conversation)
