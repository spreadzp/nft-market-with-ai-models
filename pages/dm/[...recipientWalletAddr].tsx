import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router' 
import useWalletProvider from '../../hooks/useWalletProvider'
import { isEns } from '../../helpers/string'
import { Conversation } from '../../common/Conversation'

const ConversationPage: NextPage = () => {
  const isBrowser = () => typeof window !== 'undefined'; 
  const router = useRouter()
  const { resolveName } = useWalletProvider()
  const [recipientWalletAddr, setRecipientWalletAddr] = useState<string>()

  useEffect(() => { 
    if(router.query.recipientWalletAddr) {
      const routeAddress =
      (Array.isArray(router.query.recipientWalletAddr)
        ? router.query.recipientWalletAddr.join('/')
        : router.query.recipientWalletAddr) ?? '' 
    setRecipientWalletAddr(String(router.query.recipientWalletAddr))
    }
    
  }, [router.query.recipientWalletAddr])

  useEffect(() => {
    if (!isBrowser() && !recipientWalletAddr && window.location.pathname.includes('/dm')) {
      router.push(window.location.pathname)
      setRecipientWalletAddr(window.location.pathname.replace('/dm/', ''))
    }
    const checkIfEns = async () => { 
      if (recipientWalletAddr && isEns(recipientWalletAddr)) {
        const address = await resolveName(recipientWalletAddr) 
        router.push(`/dm/${address}`)
      }
    }
    checkIfEns()
  }, [recipientWalletAddr,isBrowser ])

  return <Conversation recipientWalletAddr={recipientWalletAddr ?? ''} />
}

export default React.memo(ConversationPage)
