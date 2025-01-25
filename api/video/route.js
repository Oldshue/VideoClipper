export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';
  
  // Debug response
  console.log('URL:', url);

  return new Response(JSON.stringify({
    message: "Test response",
    receivedUrl: url
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
