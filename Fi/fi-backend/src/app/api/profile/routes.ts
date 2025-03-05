import { Router } from 'express';

const router = Router();

router.get('/getProfile/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ message: "Profile endpoint", userId });
});

export default router;