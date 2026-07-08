import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Middleware to check for ADMIN role
const requireAdmin = (req: any, res: Response, next: any) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeAlerts = await prisma.incident.count({
      where: { status: 'Active' }
    });
    const nodes = await prisma.event.count(); // proxy for node events
    
    res.json({
      totalUsers,
      activeAlerts,
      systemHealth: 99.9,
      nodes
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/logs', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    const formattedIncidents = incidents.map(inc => ({
      id: inc.id,
      user: inc.user.name,
      location: `${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}`,
      type: inc.title,
      time: inc.createdAt,
      status: inc.status
    }));

    res.json(formattedIncidents);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
