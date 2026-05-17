import server from '../dist/server/server.js';

export default async function handler(request) {
  try {
    return await server.fetch(request);
  } catch (err) {
    console.error('Serverless Function SSR Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
