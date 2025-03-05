import { Router } from 'express';

const router = Router();

router.post('/analyze', (req, res) => {
  res.json({ message: "Chat analysis endpoint" });
});

export default router;