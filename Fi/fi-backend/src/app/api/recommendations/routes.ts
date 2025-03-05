import { Router } from 'express';

const router = Router();

router.post('/generate', (req, res) => {
  res.json({ message: "Generate recommendations endpoint" });
});

export default router;