export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+/)?.[1] || '';
    return Response.json({
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      quality: 'HD',
      duration: 0
    });
  } catch (error) {
    return Response.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { url, startTime, endTime } = await request.json();
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+/)?.[1] || '';
    
    return Response.json({
      downloadUrl: `https://your-download-service.com/download?v=${videoId}&start=${startTime}&end=${endTime}`
    });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
