import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video info: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      title: data.title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      quality: 'HD',
      duration: 0
    });
  } catch (error) {
    console.error('Video info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video info' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, startTime, endTime } = body;

    if (!url || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required parameters' }, 
        { status: 400 }
      );
    }

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' }, 
        { status: 400 }
      );
    }

    // Simulate download URL generation
    const downloadUrl = `https://your-download-service.com/download?v=${videoId}&start=${startTime}&end=${endTime}`;
    
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process video request' }, 
      { status: 500 }
    );
  }
}
