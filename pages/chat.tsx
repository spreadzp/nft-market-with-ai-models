import type { NextPage } from 'next'
import Layout from '../common/Layout'; 
import BlankConversation from './dm';

const Chat: NextPage = () => {
  return ( 
  <Layout ><BlankConversation /></Layout> 
  )
}

export default Chat; 