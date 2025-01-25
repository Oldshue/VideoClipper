'use client';

import { useState, useCallback } from 'react';

const VideoClipper = () => {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [fetchingInfo, setFetchingInfo] = useState(false);

  const validateTime = (time) => {
    if (!time) return false;
    const regex = /^(?:(\d+):)?([0-5]?\d):([0-5]\d)$/;
    return regex.test(time);
  };

  const fetchVideoInfo = useCallback(async (url) => {
    if (!url) return;
    
    try {
      setFetchingInfo(true);
      setError('');
      
      const response = await fetch(`/api/video?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      setVideoInfo(data);
    } catch (err) {
      setError(err.message);
      setVideoInfo(null);
    } finally {
      setFetchingInfo(false);
    }
  }, []);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value.trim();
    setUrl(newUrl);
    setError('');
    setVideoInfo(null);
    
    if (newUrl) {
      fetchVideoInfo(newUrl);
    }
  };

  const handleDownload = async () => {
    try {
      if (!url || !startTime || !endTime) {
        throw new Error('Please fill in all fields');
      }

      if (!validateTime(startTime) || !validateTime(endTime)) {
        throw new Error('Invalid time format. Use HH:MM:SS or MM:SS');
      }

      setIsLoading(true);
      setError('');

      const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
      if (videoId) {
        window.location.href = `https://www.youtube.com/watch?v=${videoId}&t=${startTime}`;
      } else {
        throw new Error('Invalid YouTube URL');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Video Clip Tool</h1>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Video URL
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter YouTube URL"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
            />
          </div>

          {fetchingInfo && (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading video details...</span>
            </div>
          )}

          {videoInfo && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium mb-4">{videoInfo.title}</h3>
              <div className="flex items-center gap-4">
                {videoInfo.thumbnail && (
                  <img 
                    src={videoInfo.thumbnail} 
                    alt="Video thumbnail" 
                    className="w-32 h-auto rounded shadow"
                  />
                )}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Quality: {videoInfo.quality}</p>
                  {videoInfo.duration > 0 && (
                    <p>Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM:SS or HH:MM:SS"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="MM:SS or HH:MM:SS"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <button
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading || fetchingInfo || !videoInfo
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200`}
            onClick={handleDownload}
            disabled={isLoading || fetchingInfo || !videoInfo}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              'Go to Video'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoClipper;
