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
    const contentType = response.headers.get('content-type');
    
    if (!response.ok || !contentType?.includes('application/json')) {
      throw new Error('Invalid response from YouTube');
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Failed to parse YouTube response');
    }

    return NextResponse.json({
      title: data.title || 'Unknown Title',
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      quality: 'HD',
      duration: 0
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch video info' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { url, startTime, endTime } = body;

    if (!url || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    return NextResponse.json({
      downloadUrl: `https://your-download-service.com/download?v=${videoId}&start=${startTime}&end=${endTime}`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to process video' }, { status: 500 });
  }
}
