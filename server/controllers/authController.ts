import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { validateAuthFields } from '../utils/authUtils';

// Đăng ký người dùng
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !confirmPassword) {
      logger.warn('Đăng ký thất bại: Thiếu trường bắt buộc');
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    // Validate các trường
    const validateResult = await validateAuthFields({ name, email, password, confirmPassword });
    if (!validateResult.success) {
      logger.warn('Đăng ký thất bại: ' + validateResult.message);
      return res.status(400).json({ success: false, message: validateResult.message });
    }
    // Kiểm tra email đã tồn tại
    else if (validateResult.user) {
      logger.warn('Đăng ký thất bại: Email đã tồn tại');
      return res.status(409).json({ success: false, message: 'Email đã tồn tại.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    logger.info(`Đăng ký thành công cho email: ${email}`);
    return res.status(201).json({ success: true, message: 'Đăng ký thành công.' });
  } catch (error: any) {
    logger.error('Lỗi đăng ký: ' + error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// Đăng nhập người dùng
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      logger.warn('Đăng nhập thất bại: Thiếu email hoặc mật khẩu');
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    // Validate các trường
    const validateResult = await validateAuthFields({ email, password });
    if (!validateResult.success) {
      logger.warn('Đăng nhập thất bại: ' + validateResult.message);
      return res.status(400).json({ success: false, message: validateResult.message });
    }
    else if (!validateResult.user || !validateResult.match) {
      logger.warn('Đăng nhập thất bại: Email hoặc mật khẩu không đúng');
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Gán user
    const user = validateResult.user;

    // Sinh token
    const token = jwt.sign(
      { userId: user._id},
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    logger.info(`Đăng nhập thành công cho email: ${email}`);
    return res.status(200).json({
      success: true,
      name: user.name,
      email: user.email,
      user_ID: user._id,
      token
    });
  } catch (error: any) {
    logger.error('Lỗi đăng nhập: ' + error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
};

// Đổi mật khẩu người dùng
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // Lấy userId từ middleware verifyToken
    const { newPassword, confirmPassword } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!userId || !newPassword || !confirmPassword) {
      logger.warn('Đổi mật khẩu thất bại: Thiếu trường bắt buộc');
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    // Validate mật khẩu mới
    const validateResult = await validateAuthFields({ userId, password: newPassword, confirmPassword});
    if (!validateResult.success) {
      logger.warn('Đổi mật khẩu thất bại: ' + validateResult.message);
      return res.status(400).json({ success: false, message: validateResult.message });
    } 
    else if (!validateResult.user){
      logger.warn('Đổi mật khẩu thất bại: Không tìm thấy user');
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    
    // Gán user
    const user = validateResult.user;

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    logger.info(`Đổi mật khẩu thành công cho user: ${userId}`);
    return res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error: any) {
    logger.error('Lỗi đổi mật khẩu: ' + error.message);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ.' });
  }
}; 