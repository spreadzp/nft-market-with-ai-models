import Image from "next/image";
import livePeerImage from './../public/livepeer.png'
type ProgressBarProps = {
    progressPercentage: number
    processName: string
}

function ProgressBar ({ progressPercentage, processName }: ProgressBarProps)  {
    return (
        <>
           <Image src={livePeerImage}  alt="Livepeer" height={32} width={64} className="mb-5 text-white bg-red-100" />
        <div className='h-1 w-full bg-gray-300'>
         
            <div
                style={{ width: `${progressPercentage}%`}}
                className={`h-full ${
                    progressPercentage < 70 ? 'bg-red-600' : 'bg-green-600'}`}>
            </div>
            <div className="h-1 text-white">{processName}: {progressPercentage}%</div>
        </div>
        </>
    );
};


export default ProgressBar;