import { Router } from 'express';

const router = Router();

router.get('/data', (req, res) => {
  res.json({ message: "Market data endpoint" });
});

export default router;