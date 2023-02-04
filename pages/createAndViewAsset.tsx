import { Player, useAssetMetrics, useCreateAsset } from '@livepeer/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ProgressBar from './progressbar';

type CreateAndViewAssetProps = {
    setPlaybackId: any
}
export default function CreateAndViewAsset({ setPlaybackId }: CreateAndViewAssetProps) {
    const [video, setVideo] = useState<File | undefined>();
    //const [PlaybackId, setPlaybackId] = useState(null)

    const {
        mutate: createAsset,
        data: asset,
        status,
        progress,
        error,
    } = useCreateAsset(
        video
            ? {
                sources: [{ name: video.name, file: video }] as const,
            }
            : null,
    );

    const { data: metrics } = useAssetMetrics({
        assetId: asset?.[0].id,
        refetchInterval: 30000,
    });

    const isLoading = useMemo(
        () =>
            status === 'loading' ||
            (asset?.[0] && asset[0].status?.phase !== 'ready'),
        [status, asset],
    );

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        console.log("🚀 ~ file: createAndViewAsset.tsx:40 ~ onDrop ~ acceptedFiles", acceptedFiles)
        if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
            setVideo(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'video/*': ['*.mp4'],
        },
        maxFiles: 1,
        onDrop
    });

    const progressFormatted = useMemo(
        () =>
            progress?.[0].phase === 'failed'
                ? 'Failed to process video.'
                : progress?.[0].phase === 'waiting'
                    ? 'Waiting'
                    : progress?.[0].phase === 'uploading'
                        ? `Uploading: ${Math.round(progress?.[0]?.progress * 100)}%`
                        : progress?.[0].phase === 'processing'
                            ? `Processing: ${Math.round(progress?.[0].progress * 100)}%`
                            : null,
        [progress],
    );

    useEffect(() => {
        if (asset && asset[0]?.playbackId) {
            setPlaybackId(asset[0]?.playbackId)
        }
    }, [asset]);
    //  const allProofs = JSON.stringify({...getRootProps()}) 
    //  const allInputProps = JSON.stringify({...getInputProps()}) 
    return (
        <>
            {/* <div>Drag and drop or browse files</div> */}
            {/* <div className="text-white"> {allProofs}  </div>
                    <div className="text-white">{ allInputProps }</div> */}
            {/* <p>
               
                </p> */}


            {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">SVG, PNG, JPG or GIF (MAX. 800x400px).</p> */}
            {/* {createError?.message && <div>{createError.message}</div>} type="file" className="hidden"*/}

            {metrics?.metrics?.[0] && (
                <div>Views: {metrics?.metrics?.[0]?.startViews}</div>
            )}
            {video ? (
                <div className="block mb-2 mt-2 text-sm font-medium text-white dark:text-white">Video file name: {video.name}</div>
            ) : (
                <div>
                    <label className="block mb-2 text-sm font-medium text-white dark:text-white" htmlFor="file_input">Select a video file to upload.</label>
                    <input name="file_input"
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600
             dark:placeholder-gray-400" aria-describedby="file_input_help block"  {...getRootProps} {...getInputProps()} style={{ "display": "block" }} />

                </div>
            )}

            <div className="m-10">
                {progressFormatted &&
                    progress?.[0].phase === 'uploading' &&
                    <ProgressBar progressPercentage={Math.round(progress?.[0]?.progress * 100)} processName={progress?.[0].phase} />}

                {progressFormatted &&
                    progress?.[0].phase === 'processing' &&
                    <ProgressBar progressPercentage={Math.round(progress?.[0]?.progress * 100)} processName={progress?.[0].phase} />}
            </div>

            {asset?.[0]?.playbackId && (
                <div className='h-25 w-25'>
                    <Player title={asset[0].name} playbackId={asset[0].playbackId} theme={{
                        borderStyles: {
                            containerBorderStyle: 'hidden',
                        },
                        colors: {
                            accent: '#00a55f',
                        },
                        sizes: {
                            trackContainerHeight: '50px',
                            thumb: 50
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
                    }} />
                </div>
            )}
            {video && status !== 'success' && <div className="">
                <button
                    onClick={() => {
                        createAsset?.();
                    }}
                    className={`h-full mt-2   rounded-2xl w-full ${createAsset ? 'bg-red-600' : 'bg-transparent'}`}
                    disabled={!createAsset || status === 'loading'}
                >
                    {!isLoading ? 'Upload the file via LivePeer' : 'Uploading...'}
                </button>
            </div>}
        </>
    );
};

{/* <div>   {console.log({...getRootProps()})}   </div>
<div> {console.log({...getInputProps()})}</div> */}