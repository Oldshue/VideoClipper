export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 });
  }

  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
  
  if (!videoId) {
    return Response.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  try {
    const infoUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(infoUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }

    const data = await response.json();

    return Response.json({
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      quality: 'HD',
      duration: 0
    });
  } catch (error) {
    return Response.json({
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      quality: 'HD',
      duration: 0
    });
  }
}

export async function POST(request) {
  try {
    const { url, startTime, endTime } = await request.json();

    if (!url || !startTime || !endTime) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
    
    if (!videoId) {
      return Response.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    return Response.json({
      downloadUrl: `https://youtube.com/watch?v=${videoId}&t=${startTime}`
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process request' }, { status: 400 });
  }
}
