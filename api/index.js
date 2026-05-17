import server from '../dist/server/server.js';

export const config = {
  runtime: 'edge', // Runs on Vercel's ultra-fast Edge runtime
};

export default async function handler(request) {
  try {
    return await server.fetch(request);
  } catch (err) {
    console.error('Edge Function SSR Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
