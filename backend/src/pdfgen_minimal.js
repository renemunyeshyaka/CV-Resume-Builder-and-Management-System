import express from 'express';

const router = express.Router();

router.post('/:cvId', (req, res) => {
  res.json({ message: 'PDF endpoint working', cvId: req.params.cvId });
});

export default router;
