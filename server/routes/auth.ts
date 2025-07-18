import { Router } from 'express';
import { signup, login } from '../controllers/authController';

const router = Router();

// Route for user registration
router.post('/signup', signup);
// Route for user login
router.post('/login', login);

export default router; 