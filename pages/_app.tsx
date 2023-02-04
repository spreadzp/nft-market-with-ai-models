import '../styles/globals.css'
import Link from 'next/link'
import { BuildingLibraryIcon, CubeTransparentIcon, ChatBubbleBottomCenterTextIcon, InboxStackIcon, WalletIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid'
import { useMemo, useState } from 'react';
// import { clientLK } from '../utils/liveKeeper';
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react';
import { AppProps } from 'next/app';
import { env } from '../next.config';
import dynamic from 'next/dynamic';
import XMTP from '../common/xmtp';
const AppWithoutSSR = dynamic(() => import('../common/xmtp'), {
  ssr: false,
})

type MyAppProps = { Component: any, pageProps: any };

function MyApp({ Component, pageProps }: AppProps<{ dehydratedState: string }>) { 
  const [activeMenuItem, setActiveMenuItem] = useState("")
  const livepeerClient = useMemo(
    () =>
      createReactClient({
        provider: studioProvider({
          apiKey:  env.LK_API,
        }),
      }),
    [],
  );
  return (
    <div className='brand-bg main-h'> 
      <nav className="border-b p-6">

        <div className="flex mt-4 nav-align justify-around">
          <p className="brand-logo "></p>
          <Link href="/" className="mr-4 brand-color text-xl font-bold nav-btn "
            onMouseEnter={() => { setActiveMenuItem("Marketplace") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'Marketplace' ? activeMenuItem : <BuildingLibraryIcon className="h-16 w-16 brand-color" title='Marketplace' />}
          </Link>
          <Link href="/create-and-list-nft" className="mr-6 brand-color text-xl font-bold nav-btn"
            onMouseEnter={() => { setActiveMenuItem("Create a new NFT") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'Create a new NFT' ? activeMenuItem : <CubeTransparentIcon className="h-16 w-16 brand-color" title='Marketplace' />}
          </Link>
          <Link href="/my-nfts" className="mr-6 brand-color text-xl font-bold nav-btn"
            onMouseEnter={() => { setActiveMenuItem("My NFTs") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'My NFTs' ? activeMenuItem : <InboxStackIcon className="h-16 w-16 brand-color" title='Marketplace' />}
          </Link>
          <Link href="/my-listed-nfts" className="mr-6 brand-color text-xl font-bold nav-btn"
            onMouseEnter={() => { setActiveMenuItem("My Listed NFTs") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'My Listed NFTs' ? activeMenuItem : <WalletIcon className="h-16 w-16 brand-color" title='Marketplace' />}
          </Link>
          <Link href="/chat" className="mr-6 brand-color text-xl font-bold nav-btn"
            onMouseEnter={() => { setActiveMenuItem("Chat") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'Chat' ? activeMenuItem : <ChatBubbleBottomCenterTextIcon className="h-16 w-16 brand-color" title='Help' />}
          </Link>
          <Link href="/help" className="mr-6 brand-color text-xl font-bold nav-btn"
            onMouseEnter={() => { setActiveMenuItem("Help") }} onMouseLeave={() => { setActiveMenuItem("") }}>
            {activeMenuItem === 'Help' ? activeMenuItem : <WrenchScrewdriverIcon className="h-16 w-16 brand-color" title='Help' />}
          </Link>
        </div>
      </nav> 
   <LivepeerConfig
        dehydratedState={pageProps?.dehydratedState}
        client={livepeerClient}
      >  
           <Component {...pageProps} /> 
      </LivepeerConfig>
   
     
    </div>
  )
}

export default MyApp