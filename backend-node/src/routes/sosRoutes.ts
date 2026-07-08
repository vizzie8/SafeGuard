import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

router.post('/trigger', authenticateToken, async (req: any, res: Response) => {
  try {
    const { triggerType, lat, lng } = req.body;
    
    // Log the event
    const event = await prisma.event.create({
      data: {
        userId: req.user.userId,
        triggerType,
        lat,
        lng
      }
    });

    // In a real app, integrate Twilio / BullMQ here
    console.log(`SOS triggered by user ${req.user.userId} at ${lat},${lng}`);
    
    res.json({ status: 'SOS Triggered Successfully', eventId: event.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
