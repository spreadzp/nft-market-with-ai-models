'use client';

import { useEffect, useMemo, useState } from 'react'
import Web3 from 'web3'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import Marketplace from '../contracts/ethereum-contracts/Marketplace.json'
import ENCNFT from '../contracts/ethereum-contracts/ENCNFT.json'
import { encryptData, getNewAccount } from '../utils/cypher'
import { metamaskEncryptData } from '../utils/metamask'
import { env } from './../next.config'
import { getTemplateByTypeFile } from '../utils/common'
import Loader from './loader'
import CreateAndViewAsset from './createAndViewAsset';
import Select from "react-tailwindcss-select";
import axios from 'axios';

type AiData = {
  value: string, 
  label: string 
}

const auth =
  'Basic ' + Buffer.from(env.NEXT_PUBLIC_IPFS_KEY + ':' + env.NEXT_PUBLIC_IPFS_SECRET).toString('base64');

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

const options: AiData[] = [
  { value: `${env.HUGGING_FACE_URL}`, label: "Stable Diffusion v2-1" },
  { value: "https://api-inference.huggingface.co/models/prompthero/openjourney", label: "prompthero/openjourney" },
  { value: "https://api-inference.huggingface.co/models/compVis/stable-diffusion-v1-4", label: "CompVis/stable-diffusion-v1-4" }
];


export default function CreateItem() {
  const [ai, setAI] = useState({} as AiData );
  // const [fileUrl, setFileUrl] = useState(null as null | string)
  const [isUploadToIpfs, setIsUploadToIpfs] = useState(false)
  const [newPrivateKey, setNewPrivateKey] = useState('')
  const [enableMint, setEnableMint] = useState(false)
  const [newPublicKey, setNewPublicKey] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [base64FileData, setBase64FileData] = useState('')
  const [encryptedData, setEncryptedData] = useState('');
  const [encryptedPBId, setEncryptedPBId] = useState('');
  const [encPrKByOwnerAddress, setEncPrKByOwnerAddress] = useState('');
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const [typeFile, setTypeFile] = useState("")
  const router = useRouter()
  const [isProcessMint, setIsProcessMint] = useState(false)
  const [playbackId, setPbId] = useState(null)
  const [isGenImage, setIsGenImage] = useState(false)




  useEffect(() => {
    if (base64FileData && newPrivateKey) {
      const encryptPrivateKeyForNFTFile = async () => {
        const web3Modal = new Web3Modal()
        const provider = await web3Modal.connect()
        const web3 = new Web3(provider)
        const accounts = await web3.eth.getAccounts()
        const encData = await encryptData(accounts[0], newPrivateKey)
        if (encData !== '') {
          setEncPrKByOwnerAddress(encData)
        }
      }
      encryptPrivateKeyForNFTFile()

    }
  }, [base64FileData, newPrivateKey]);


  useEffect(() => {
    const encodePlayBackId = async () => {
      try {
        if (base64FileData && newPublicKey) {
          const encData = await metamaskEncryptData(base64FileData, newPublicKey)
          if (encData !== '') {
            setEncryptedPBId(encData)
          }
        }
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }
    encodePlayBackId()
  }, [newPublicKey, base64FileData]);

  // async function onChange(e: any) {
  //   const file = e.target.files[0]
  //   generateKeys()
  //   createImage(file)
  // }

  const handleChange = (value: any) => {
    console.log("value:", value);
    setAI(value);
  };

  const generatedImage = useMemo(() => base64FileData, [base64FileData]);
  // const defineTypeFile = (base64Code: string) => {
  //   return base64Code.split(';')[0].split('/')[0].split(":")[1];
  // }

  // const createImage = async (file: any) => {
  //   const reader = new FileReader()
  //   // eslint-disable-next-line
  //   reader.onload = async (e: any) => {
  //     // this.image = e.target.result
  //     const res = await reader.result?.toString()
  //     if (res) {
  //       setBase64FileData(res)
  //       setTypeFile(defineTypeFile(res))
  //     }
  //   }
  //   reader.readAsDataURL(file)
  // }

  const generateKeys = () => {
    const newIdentity = getNewAccount()
    setNewPrivateKey(newIdentity.privateKey)
    setNewPublicKey(newIdentity.publicKey)
    setNewAddress(newIdentity.address)
  }

  useEffect(() => {
    const { name, description, price } = formInput
    console.log('encryptedPBId', encryptedPBId)
    console.log('playbackId :>>', playbackId)
    if (name && description && +price > 0 && encryptedPBId && encPrKByOwnerAddress) {
      setEnableMint(true)

    } else {
      setEnableMint(false)
    }
  }, [formInput, encryptedPBId, encPrKByOwnerAddress]);

  async function uploadToIPFS() {
    console.log('encryptedPBId :>>', encryptedPBId)
    const { name, description, price } = formInput
    if (!name || !description || !price || !encryptedPBId || !base64FileData) {
      return
    } else {

      try {

        const uploadedPreviewFile = await client.add(encryptedPBId)
        console.log("🚀 ~ file: create-and-list-nft.tsx:153 ~ uploadToIPFS ~ uploadedPreviewFile", uploadedPreviewFile)
        if (uploadedPreviewFile) {
          const uploadedPreviewUrl = `https://caravan.infura-ipfs.io/ipfs/${uploadedPreviewFile.path}`
          // console.log("🚀 ~ file: create-and-list-nft.tsx:136 ~ uploadToIPFS ~ uploadedEncImageUrl", uploadedEncImageUrl)
          const data = JSON.stringify({
            // typeFile = 'video' hardcoded
            name, description: `${'image'};${description}`, image: uploadedPreviewUrl 
          })
          const added = await client.add(data)
          const url = `https://caravan.infura-ipfs.io/ipfs/${added.path}`
          console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 158 ~ uploadToIPFS ~ url", url)
          return url
        }

      } catch (error) {
        console.log('Error uploading file: ', error)
      } finally {
        setBase64FileData("")
        setIsUploadToIpfs(false)
      }
    }
  }
  async function generateImage() {
    // const url = `${env.HUGGING_FACE_URL}`; 
    if(ai?.value) {
      setIsGenImage(true)
      const response = await axios({
        url: ai?.value,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.HUGGING_FACE_TOKEN}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          inputs: formInput.description,
          options: {
            wait_for_model: true
          }
        }),
        responseType: 'arraybuffer'
      })
      if(response) {
        generateKeys();
      }
      const type = response.headers['content-type'];
      const data = response.data;
      const b64Data = Buffer.from(data).toString('base64');
      const imgB64 = `data:${type};base64,${b64Data}`;
      setTypeFile('image')
      setBase64FileData(imgB64);
      setIsGenImage(false)
    }
    
  }

  async function listNFTForSale() {
    try {
      const web3Modal = new Web3Modal()
      const provider = await web3Modal.connect()
      const web3 = new Web3(provider)
      setIsUploadToIpfs(true)
      const url = await uploadToIPFS()

      setIsProcessMint(true)
      const networkId = await web3.eth.net.getId()
      // Mint the NFT
      const encodedNftContractAddress = ENCNFT.networks[`${networkId}` as keyof typeof ENCNFT.networks].address
      const encodedNftContract = new web3.eth.Contract(ENCNFT.abi as any, encodedNftContractAddress)
      const accounts = await web3.eth.getAccounts()
      const marketPlaceContract = new web3.eth.Contract(Marketplace.abi as any, Marketplace.networks[`${networkId}` as keyof typeof Marketplace.networks].address)
      let listingFee = await marketPlaceContract.methods.getListingFee().call()
      listingFee = listingFee.toString()
      encodedNftContract.methods.mint(url, encPrKByOwnerAddress).send({
        from: accounts[0]
      }).on('receipt', function (receipt: any) {
        // List the NFT
        const tokenId = receipt.events.NFTMinted.returnValues[0];
        console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 199 ~ encodedNftContract.methods.mint ~ tokenId", tokenId)
        if (tokenId) {

          marketPlaceContract.methods.moveTokenForSell(tokenId, "Listing announce", Web3.utils.toWei(formInput.price, "ether"), encodedNftContractAddress)//Web3.utils.toWei(formInput.price, "ether"))
            .send({ from: accounts[0], value: listingFee }).on('receipt', function () {
              console.log('listed')
              setIsProcessMint(false)
              router.push('/')
            });
        }
      }).on('error', (err: any) => {
        console.log("🚀 ~ file: create-and-list-nft.tsx ~ line 200 ~ encodedNftContract.methods.mint ~ err", err)
        setIsProcessMint(false)
      });
    } catch (err) {
      console.log('err :>>', err)
    }
  }


  return (
    <div className="flex items-start justify-center main-h brand-bg mint-nft">
      <div className="flex flex-col  create-form border-rose-500 p-5 w-100">
        <label htmlFor="name-nft" className='text-xl font-bold text-white' >NAME </label>
        <input
          name="name-nft"
          placeholder="Asset Name"
          className="mb-5 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />

        <label htmlFor="description" className='text-xl font-bold text-white' >Description </label>
        <textarea
          placeholder="Asset Description" name="description"
          className="mb-5 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <label htmlFor="price" className='text-xl font-bold text-white' >Price </label>
        <input
          name="price"
          type="number"
          placeholder="Asset Price in Eth"
          className="mb-5 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
       <label htmlFor="ai" className='text-xl font-bold text-white' >AI models for generate an image </label>
        <Select 
          placeholder='Chose AI model text to image'
          primaryColor='blue'
          value={ai}
          onChange={handleChange}
          options={options}
        />

        {/* {!base64FileData &&
          <div>
            <label className="block mb-2 text-sm font-medium text-white dark:text-white" htmlFor="file_input">Upload poster image</label>
            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="file_input_help"
              id="file_input" name="file" onChange={onChange} type="file" />
          </div>
          } */}
          {isGenImage && <Loader />}
        {!base64FileData && ai?.value && !isGenImage && formInput.description && <button onClick={generateImage} className="font-bold mint-btn rounded mt-10 p-4 shadow-lg">
          Generate an image by AI model: 
             {ai?.label}
        </button>}
        {
          generatedImage && <div className="poster">
            <div className="block mb-2 text-sm font-medium text-white dark:text-white">Generated Image</div>
            {getTemplateByTypeFile(generatedImage, typeFile)}
          </div>

        }
        {/* {base64FileData && <div className='p-1 '>
          <CreateAndViewAsset setPlaybackId={setPbId} />
        </div>} */}
    {/* {base64FileData && !isUploadToIpfs && <button onClick={listNFTForSale} className="font-bold mint-btn rounded mt-10 p-4 shadow-lg">
          Encode the Image
        </button>} */}

        {isUploadToIpfs && enableMint &&
          <Loader />

        }
        {!isUploadToIpfs && enableMint && !isProcessMint && <button onClick={listNFTForSale} className="font-bold mint-btn rounded mt-10 p-4 shadow-lg">
          Mint and list NFT
        </button>}
        {isProcessMint && enableMint && <button type="button" className="font-bold mint-btn text-white rounded mt-10 p-4 shadow-lg" disabled>Processing in Metamask...</button>}

      </div>
    </div>
  )
}

