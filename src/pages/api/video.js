import { spawn } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import { createReadStream } from 'fs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { url } = req.query;
    if (!url) {
      res.status(400).json({ error: 'URL required' });
      return;
    }

    try {
      const infoProcess = spawn('yt-dlp', ['--dump-json', url]);
      let output = '';
      let errorOutput = '';

      infoProcess.stdout.on('data', (data) => {
        output += data;
      });

      infoProcess.stderr.on('data', (data) => {
        errorOutput += data;
      });

      await new Promise((resolve, reject) => {
        infoProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`yt-dlp failed: ${errorOutput}`));
          }
        });
      });

      const videoInfo = JSON.parse(output);
      res.status(200).json({
        title: videoInfo.title,
        duration: videoInfo.duration || 0,
        quality: videoInfo.format || 'Unknown',
        thumbnail: videoInfo.thumbnail
      });
    } catch (error) {
      console.error('Video info error:', error);
      res.status(500).json({ error: 'Video info retrieval failed' });
    }
  }

  else if (req.method === 'POST') {
    const { url, startTime, endTime } = req.body;
    if (!url || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing parameters' });
      return;
    }

    const outputFile = join(tmpdir(), `clip-${Date.now()}.mp4`);

    try {
      await new Promise((resolve, reject) => {
        const ytDlp = spawn('yt-dlp', [
          '--format', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
          '--no-playlist',
          '--download-sections', `*${startTime}-${endTime}`,
          '--recode-video', 'mp4',
          '--force-overwrites',
          '--output', outputFile,
          url
        ]);

        let errorOutput = '';
        ytDlp.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error(`yt-dlp error: ${data}`);
        });

        ytDlp.stdout.on('data', (data) => {
          console.log(`yt-dlp output: ${data}`);
        });

        ytDlp.on('close', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`yt-dlp failed with code ${code}. Error: ${errorOutput}`));
          }
        });
      });

      const stream = createReadStream(outputFile);
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="clip.mp4"'
      });

      stream.pipe(res);
      
      stream.on('end', () => unlink(outputFile).catch(console.error));
      stream.on('error', async (error) => {
        console.error('Stream error:', error);
        await unlink(outputFile).catch(() => {});
        if (!res.headersSent) {
          res.status(500).json({ error: 'Video streaming failed' });
        }
      });

    } catch (error) {
      console.error('Processing error:', error);
      await unlink(outputFile).catch(() => {});
      if (!res.headersSent) {
        res.status(500).json({ error: 'Video processing failed' });
      }
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
    responseLimit: false,
  },
}
