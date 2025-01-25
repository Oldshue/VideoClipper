export const runtime = 'edge';

export async function GET(request) {
  // Always return valid JSON instead of making external requests
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';
  
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];
  
  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    title: 'YouTube Video',
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    quality: 'HD',
    duration: 0
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  try {
    const { url, startTime, endTime } = await request.json();
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/)?.[1];

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      downloadUrl: `https://youtube.com/watch?v=${videoId}&t=${startTime}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
