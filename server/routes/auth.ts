import { Router } from 'express';
import { signup, login, changePassword } from '../controllers/authController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

// Route for user registration
router.post('/signup', signup);
// Route for user login
router.post('/login', login);
// Route đổi mật khẩu
router.post('/change-password', verifyToken, changePassword);

export default router; 