import Layout from "./Layout"; 

type AppProps = {
  children?: React.ReactNode
}

function XMTP({ children }: AppProps) {
  return <Layout>{children}</Layout>
}
export default XMTP;