import React, { useState } from 'react';

const VideoClipper = () => {
 const [url, setUrl] = useState('');
 const [startTime, setStartTime] = useState('');
 const [endTime, setEndTime] = useState('');
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [progress, setProgress] = useState(0);

 const handleDownload = async () => {
   try {
     setError('');
     setIsLoading(true);
     const response = await fetch('/api/video', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ url, startTime, endTime })
     });

     if (!response.ok) {
       const data = await response.json();
       throw new Error(data.error || 'Download failed');
     }

     // Handle download
     const blob = await response.blob();
     const downloadUrl = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = downloadUrl;
     a.download = 'clip.mp4';
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(downloadUrl);

   } catch (err) {
     setError(err.message);
   } finally {
     setIsLoading(false);
     setProgress(0);
   }
 };

 return (
   <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
     <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
       <h1 className="text-3xl font-bold mb-8 text-gray-800">Video Clip Tool</h1>
       
       <div className="space-y-6">
         <div>
           <label className="block text-sm font-semibold text-gray-700 mb-2">
             YouTube URL
           </label>
           <input
             type="text"
             className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
             placeholder="https://youtube.com/watch?v=..."
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             disabled={isLoading}
           />
         </div>

         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               Start Time
             </label>
             <input
               type="text"
               className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
               placeholder="MM:SS"
               value={startTime}
               onChange={(e) => setStartTime(e.target.value)}
               disabled={isLoading}
             />
           </div>

           <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">
               End Time
             </label>
             <input
               type="text"
               className="w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
               placeholder="MM:SS"
               value={endTime}
               onChange={(e) => setEndTime(e.target.value)}
               disabled={isLoading}
             />
           </div>
         </div>

         {error && (
           <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
             {error}
           </div>
         )}

         {progress > 0 && progress < 100 && (
           <div className="w-full bg-gray-200 rounded-full h-2">
             <div 
               className="bg-blue-500 h-2 rounded-full transition-all duration-300"
               style={{ width: `${progress}%` }}
             />
           </div>
         )}

         <button
           className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
             isLoading 
               ? 'bg-gray-400 cursor-not-allowed'
               : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
           }`}
           onClick={handleDownload}
           disabled={isLoading || !url || !startTime || !endTime}
         >
           {isLoading ? 'Processing...' : 'Download Clip'}
         </button>
       </div>
     </div>
   </div>
 );
};

export default VideoClipper;
