import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const runtime = 'nodejs';
export const maxDuration = 300;

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
      duration: 0
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

    // Create temp directory
    const tempDir = path.join(os.tmpdir(), 'video-clips');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const outputPath = path.join(tempDir, `${videoId}-${Date.now()}.mp4`);

    // Use yt-dlp to download and trim video
    await new Promise((resolve, reject) => {
      const process = spawn('yt-dlp', [
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--download-sections', `*${startTime}-${endTime}`,
        '-o', outputPath,
        url
      ]);

      process.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to process video'));
      });

      process.on('error', reject);
    });

    // Read the file and return it
    const videoBuffer = await fs.promises.readFile(outputPath);
    
    // Clean up
    fs.unlinkSync(outputPath);

    // Return the video file
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="video-clip.mp4"`
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 });
  }
}
