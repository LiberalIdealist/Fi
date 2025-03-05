import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ message: "Login endpoint" });
});

router.post('/signup', (req, res) => {
  res.json({ message: "Signup endpoint" });
});

export default router;