import { Player } from '@livepeer/react';
import {
  // LivepeerConfig,
  createReactClient,
  studioProvider,
} from '@livepeer/react';
import axios from 'axios';


import Image from 'next/image';
import { useEffect, useState } from 'react';

import blenderPoster from './../public/brand.png';

type PosterImageProps = {
  imageUrl: string
}
function PosterImage({ imageUrl }: PosterImageProps) {
  const [imageData, setImageData] = useState('')
  useEffect(() => {
    const getImageData = async () => {
      const res = await axios.get(imageUrl)
      setImageData(res.data)
    }
    getImageData()
  }, [imageUrl]);
  return (
    <>
      {imageData && <Image
        src={imageData}
        fill
        priority
        // placeholder="blur"
        alt=""
      />}
    </>
  );
};
export const getTemplateByTypeFile = (imageBase64: string, typeFile: string, pbId?: string, titleVideo?: string) => {

  switch (typeFile) {
    case 'image': return (<img className="rounded " width="350" src={imageBase64} />)
    case 'video': return (
      <Player
        title={titleVideo}
        playbackId={pbId} 
        poster={<PosterImage imageUrl={imageBase64} />}
        showPipButton
        objectFit="cover"
        theme={{
          borderStyles: {
            containerBorderStyle: 'hidden',
          },
          colors: {
            accent: '#00a55f',
          },
          space: {
            controlsBottomMarginX: '10px',
            controlsBottomMarginY: '5px',
            controlsTopMarginX: '15px',
            controlsTopMarginY: '10px',
          },
          radii: {
            containerBorderRadius: '0px',
          },
        }}
      />)
    // case 'video': return (<video className="rounded " controls width="250" height="240">
    //   <source src={base64Content}
    //     type="video/webm"></source>
    // </video>)
    // case 'audio': return (<audio className="rounded " controls src={base64Content}  ></audio>)
    // case 'application': return (
    //   <embed id="pdfID" className="rounded" color="white" type="text/html" width="100%" height="100%" src={base64Content}></embed>
    //   // <iframe src={  b64DecodeUnicode(base64Content)}
    //   // width="250" height="240"
    //   // >
    //   // </iframe>
    //)
    default: return (<textarea className="rounded  text-white" rows={80} cols={60} value={imageBase64} />)
  }
}