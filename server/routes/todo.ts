import { Router } from 'express';
import verifyToken from '../middleware/verifyToken';
import { getTodos } from '../controllers/todoController';

const router = Router();

// Route to get all todos for the authenticated user
router.get('/todos', verifyToken, getTodos);

export default router; 