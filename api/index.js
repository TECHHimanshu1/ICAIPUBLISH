import server from '../dist/server/server.js';

// Helper to convert Node.js req to Web Request
async function toWebRequest(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url}`;
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const options = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Read the body from the request stream
    options.body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', err => reject(err));
    });
  }

  return new Request(url, options);
}

// Helper to write Web Response back to Node.js res
async function sendWebResponse(webRes, res) {
  res.statusCode = webRes.status;
  res.statusMessage = webRes.statusText;

  webRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const body = webRes.body;
  if (body) {
    const reader = body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

export default async function handler(req, res) {
  try {
    const request = await toWebRequest(req);
    const response = await server.fetch(request);
    await sendWebResponse(response, res);
  } catch (err) {
    console.error('Serverless Function SSR Error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
