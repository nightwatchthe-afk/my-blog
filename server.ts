import express from 'express';
import { createServer as createViteServer } from 'vite';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  // Use the provided connection string or fallback to environment variable
  const dbUrl = process.env.DATABASE_URL || 'mysql://avnadmin:AVNS_o-0P4-Jk4V5y179d6tV@mysql-2ec91ec3-nightwatchthe-3531.l.aivencloud.com:17214/defaultdb?ssl-mode=REQUIRED';
  
  let pool: mysql.Pool | null = null;

  try {
    pool = mysql.createPool(dbUrl);
    // Initialize tables
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt BIGINT NOT NULL
      )
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        categoryId VARCHAR(36) NOT NULL,
        coverImage LONGTEXT,
        bgMusicUrl TEXT,
        createdAt BIGINT NOT NULL,
        updatedAt BIGINT NOT NULL,
        authorId VARCHAR(255) NOT NULL
      )
    `);
    connection.release();
    console.log('MySQL connected and tables initialized.');
  } catch (err) {
    console.error('Failed to connect to MySQL or initialize tables:', err);
  }

  // API Routes
  app.post('/api/upload', async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Upload directly to Cloudinary
      // Cloudinary accepts base64 data URIs directly
      const uploadResponse = await cloudinary.uploader.upload(data, {
        folder: 'blog_images',
        resource_type: 'auto'
      });
      
      res.json({ url: uploadResponse.secure_url });
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }
  });

  app.get('/api/categories', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY createdAt DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post('/api/categories', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      const { id, name, description } = req.body;
      const isNew = !id;
      const finalId = id || Math.random().toString(36).substring(2, 15);
      
      if (isNew) {
        await pool.query(
          'INSERT INTO categories (id, name, description, createdAt) VALUES (?, ?, ?, ?)',
          [finalId, name, description || '', Date.now()]
        );
      } else {
        await pool.query(
          'UPDATE categories SET name = ?, description = ? WHERE id = ?',
          [name, description || '', finalId]
        );
      }
      res.json({ id: finalId });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/api/articles', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      const [rows] = await pool.query('SELECT * FROM articles ORDER BY createdAt DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      const [rows]: any = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post('/api/articles', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      const { id, title, content, categoryId, coverImage, bgMusicUrl, authorId } = req.body;
      const isNew = !id;
      const finalId = id || Math.random().toString(36).substring(2, 15);
      const now = Date.now();
      
      if (isNew) {
        await pool.query(
          'INSERT INTO articles (id, title, content, categoryId, coverImage, bgMusicUrl, createdAt, updatedAt, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [finalId, title, content, categoryId, coverImage || '', bgMusicUrl || '', now, now, authorId || 'admin']
        );
      } else {
        await pool.query(
          'UPDATE articles SET title = ?, content = ?, categoryId = ?, coverImage = ?, bgMusicUrl = ?, updatedAt = ?, authorId = ? WHERE id = ?',
          [title, content, categoryId, coverImage || '', bgMusicUrl || '', now, authorId || 'admin', finalId]
        );
      }
      res.json({ id: finalId });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.delete('/api/articles/:id', async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not configured' });
    try {
      await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Explicit route for downloading the source code zip
  app.get('/download-source', (req, res) => {
    const zipPath = path.join(__dirname, 'public', 'my-blog-source.zip');
    res.download(zipPath, 'my-blog-source.zip', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(404).send('File not found or error downloading.');
        }
      }
    });
  });

  // Serve public/imageback explicitly so runtime uploads are available in production
  app.use('/imageback', express.static(path.join(__dirname, 'public', 'imageback')));

  // Vite middleware for development
  const fs = await import('fs');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist', 'index.html'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Explicit fallback for SPA in development
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fsPromises = await import('fs/promises');
        let template = await fsPromises.readFile(path.join(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
