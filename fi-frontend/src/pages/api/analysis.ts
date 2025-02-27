import { NextApiRequest, NextApiResponse } from 'next';
import { processWithGemini } from '@/utils/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const analysisRequest = req.body;
      const analysis = await processWithGemini(analysisRequest.query);
      res.status(200).json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process analysis request' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}