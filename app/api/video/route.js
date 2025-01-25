import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  const videoId = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];

  if (!videoId) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const data = {
    title: 'YouTube Video',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    quality: 'HD',
    duration: 0
  };

  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();
  const { url, startTime, endTime } = body;

  if (!url || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];

  if (!videoId) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  return NextResponse.json({
    downloadUrl: `https://youtube.com/watch?v=${videoId}&t=${startTime}`
  });
}
