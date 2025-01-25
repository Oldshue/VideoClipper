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

      const response = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, startTime, endTime })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Trigger file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'video-clip.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Video Clip Tool</h1>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter YouTube URL"
                value={url}
                onChange={handleUrlChange}
                disabled={isLoading}
              />
            </div>

            {fetchingInfo && (
              <div className="flex items-center justify-center text-blue-600 py-4">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading video details...
              </div>
            )}

            {videoInfo && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-medium text-lg mb-3">{videoInfo.title}</h3>
                <div className="flex gap-6">
                  {videoInfo.thumbnail && (
                    <img 
                      src={videoInfo.thumbnail} 
                      alt="Video thumbnail" 
                      className="w-40 rounded-lg shadow-md"
                    />
                  )}
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">Quality:</span> {videoInfo.quality}
                    </p>
                    {videoInfo.duration > 0 && (
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-900">Duration:</span> {' '}
                        {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM:SS or HH:MM:SS"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM:SS or HH:MM:SS"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg transition-colors
                ${isLoading || fetchingInfo || !videoInfo
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              onClick={handleDownload}
              disabled={isLoading || fetchingInfo || !videoInfo}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Download Clip'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoClipper;
