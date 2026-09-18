import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const contentFile = join(process.cwd(), 'public/content/speakers.json');
const uploadDir = join(process.cwd(), 'public/uploads/speakers');
const speakerEditorEnabled = process.env.VITE_SPEAKERS_EDITOR === '1';

// Editing runs only on the local Vite server. The public build reads the saved JSON/images.
function localSpeakerEditor(): Plugin {
  return {
    name: 'local-speaker-editor',
    configureServer(server) {
      // Vite indexes public files when it starts. Newly uploaded photos need a
      // direct route so they are available immediately, without restarting Vite.
      server.middlewares.use('/uploads/speakers', async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
        const filename = (req.url ?? '').split('?')[0].replace(/^\/+/, '');
        const match = /^([a-f0-9]{20})\.(png|jpg|webp)$/.exec(filename);
        if (!match) { res.writeHead(404).end(); return; }
        try {
          const data = await readFile(join(uploadDir, filename));
          const mime = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }[match[2] as 'png' | 'jpg' | 'webp'];
          res.writeHead(200, { 'Content-Type': mime, 'Content-Length': data.length, 'Cache-Control': 'no-store' });
          res.end(req.method === 'HEAD' ? undefined : data);
        } catch {
          res.writeHead(404).end();
        }
      });
      if (!speakerEditorEnabled) return;
      server.middlewares.use('/api/speakers', async (req, res) => {
        if (req.method !== 'PUT') { res.writeHead(405).end(); return; }
        try {
          const body = await readBody(req, 100_000);
          const value: unknown = JSON.parse(body.toString('utf8'));
          if (!Array.isArray(value) || value.length > 100 || !value.every(validSpeaker)) throw Error('Проверьте данные карточек.');
          await mkdir(join(process.cwd(), 'public/content'), { recursive: true });
          const temp = `${contentFile}.tmp`;
          await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
          await rename(temp, contentFile);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
      server.middlewares.use('/api/speaker-photo', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405).end(); return; }
        try {
          const data = await readBody(req, 8 * 1024 * 1024);
          const mime = req.headers['content-type'];
          const signature = data.subarray(0, 12);
          const kind = mime === 'image/png' && signature.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
            : mime === 'image/jpeg' && signature.subarray(0, 3).equals(Buffer.from([255,216,255])) ? 'jpg'
            : mime === 'image/webp' && signature.subarray(0, 4).toString() === 'RIFF' && signature.subarray(8, 12).toString() === 'WEBP' ? 'webp'
            : null;
          if (!kind) throw Error('Выберите PNG, JPEG или WebP до 8 МБ.');
          const filename = `${createHash('sha256').update(data).digest('hex').slice(0, 20)}.${kind}`;
          await mkdir(uploadDir, { recursive: true });
          await writeFile(join(uploadDir, filename), data);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ path: `uploads/speakers/${filename}` }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: String(error instanceof Error ? error.message : error) }));
        }
      });
    },
  };
}
function validSpeaker(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const speaker = value as Record<string, unknown>;
  return typeof speaker.id === 'string' && /^[a-z0-9-]{1,80}$/.test(speaker.id)
    && typeof speaker.name === 'string' && speaker.name.trim().length > 0 && speaker.name.length <= 120
    && typeof speaker.description === 'string' && speaker.description.trim().length > 0 && speaker.description.length <= 2000
    && typeof speaker.photo === 'string' && /^(assets\/[a-z0-9-]+\.(png|jpg|jpeg|webp)|uploads\/speakers\/[a-f0-9]{20}\.(png|jpg|webp))$/.test(speaker.photo)
    && (speaker.fit === 'contain' || speaker.fit === 'cover')
    && typeof speaker.photoX === 'number' && speaker.photoX >= 0 && speaker.photoX <= 100
    && typeof speaker.photoY === 'number' && speaker.photoY >= 0 && speaker.photoY <= 100
    && typeof speaker.zoom === 'number' && speaker.zoom >= 1 && speaker.zoom <= 2.5;
}
async function readBody(req: AsyncIterable<Uint8Array>, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limit) throw Error('Файл или данные слишком большие.');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default defineConfig({
  base: './',
  plugins: [react(), localSpeakerEditor()],
  server: { watch: { ignored: ['**/public/content/**', '**/public/uploads/**'] } },
  css: { postcss: { plugins: [] } },
});
