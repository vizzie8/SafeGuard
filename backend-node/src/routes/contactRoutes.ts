import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.userId }
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone required' });
      return;
    }
    const contact = await prisma.contact.create({
      data: { name, phone, userId: req.user.userId }
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
