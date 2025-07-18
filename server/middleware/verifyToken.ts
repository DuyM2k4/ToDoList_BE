import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Mở rộng interface Request để thêm userId
// Cho phép gán userId vào request sau khi xác thực token

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Middleware xác thực JWT access token từ header Authorization.
 * Nếu hợp lệ, gán userId vào req và gọi next().
 * Nếu không hợp lệ hoặc thiếu, trả về lỗi 401/403.
 */
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Từ chối truy cập: Không có token');
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy access token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decoded.userId;
    logger.info(`Xác thực token thành công cho user: ${decoded.userId}`);
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logger.error('Token đã hết hạn: ' + error.message);
      return res.status(401).json({ success: false, message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    logger.error('Token không hợp lệ: ' + error.message);
    return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
  }
};

export default verifyToken; 