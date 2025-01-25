import { useState, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

      const { downloadUrl } = await response.json();
      window.location.href = downloadUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Video Clip Tool</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Video URL
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Enter video URL"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
            />
          </div>

          {fetchingInfo && (
            <div className="text-blue-400 text-sm animate-pulse">
              Loading video details...
            </div>
          )}

          {videoInfo && (
            <div className="bg-gray-700 p-4 rounded border border-gray-600">
              <h3 className="font-medium text-white mb-2">{videoInfo.title}</h3>
              <div className="flex items-center gap-4">
                {videoInfo.thumbnail && (
                  <img 
                    src={videoInfo.thumbnail} 
                    alt="Video thumbnail" 
                    className="w-24 h-auto rounded"
                  />
                )}
                <div className="text-sm text-gray-300">
                  <p>Quality: {videoInfo.quality}</p>
                  {videoInfo.duration > 0 && (
                    <p>Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Start Time
              </label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="MM:SS or HH:MM:SS"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                End Time
              </label>
              <input
                type="text"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="MM:SS or HH:MM:SS"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <button
            className={`w-full p-2 rounded text-white font-medium ${
              isLoading || fetchingInfo || !videoInfo
                ? 'bg-blue-500 opacity-50 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={handleDownload}
            disabled={isLoading || fetchingInfo || !videoInfo}
          >
            {isLoading ? 'Processing...' : 'Download Clip'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoClipper;
