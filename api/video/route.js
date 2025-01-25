import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const data = await response.json();

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    if (!videoId) {
      throw new Error('Invalid video URL');
    }

    return NextResponse.json({
      title: data.title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      quality: 'HD',
      duration: 0 // Duration not available through oembed
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { url, startTime, endTime } = await request.json();

    if (!url || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 });
    }

    // Return download link instead of processing video
    return NextResponse.json({
      downloadUrl: `https://your-download-service.com/download?v=${videoId}&start=${startTime}&end=${endTime}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 });
  }
}
