'use client';

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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

      // Connect to your actual video processing backend here
      const ytDlpUrl = `https://www.youtube.com/watch?v=${url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1]}&t=${startTime}`;
      window.location.href = ytDlpUrl;

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Video Clip Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Video URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="Enter YouTube URL"
              value={url}
              onChange={handleUrlChange}
              disabled={isLoading}
              className="bg-gray-50"
            />
          </div>

          {fetchingInfo && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading video details...</span>
            </div>
          )}

          {videoInfo && (
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="text"
                placeholder="MM:SS or HH:MM:SS"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isLoading}
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="text"
                placeholder="MM:SS or HH:MM:SS"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isLoading}
                className="bg-gray-50"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isLoading || fetchingInfo || !videoInfo}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Go to Video'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoClipper;
