import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Đăng ký người dùng
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !confirmPassword) {
      logger.warn('Đăng ký thất bại: Thiếu trường bắt buộc');
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    // Kiểm tra name hợp lệ
    const nameRegex = /^[a-zA-Z0-9 ]+$/;
    if (!nameRegex.test(name)) {
      logger.warn('Đăng ký thất bại: Tên không hợp lệ');
      return res.status(400).json({ success: false, message: 'Tên chỉ được chứa ký tự chữ, số và dấu cách.' });
    }
    if (name.length > 255) {
      logger.warn('Đăng ký thất bại: Tên vượt quá 255 ký tự');
      return res.status(400).json({ success: false, message: 'Tên tối đa 255 ký tự.' });
    }
    // Kiểm tra email hợp lệ
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      logger.warn('Đăng ký thất bại: Email không hợp lệ');
      return res.status(400).json({ success: false, message: 'Email phải là Gmail hợp lệ, không dấu cách.' });
    }
    if (email.length > 255) {
      logger.warn('Đăng ký thất bại: Email vượt quá 255 ký tự');
      return res.status(400).json({ success: false, message: 'Email tối đa 255 ký tự.' });
    }
    // Kiểm tra password hợp lệ
    if (password.length < 6 || password.length > 255) {
      logger.warn('Đăng ký thất bại: Mật khẩu không hợp lệ');
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 6 đến 255 ký tự.' });
    }
    if (password.includes(' ')) {
      logger.warn('Đăng ký thất bại: Mật khẩu chứa dấu cách');
      return res.status(400).json({ success: false, message: 'Mật khẩu không được chứa dấu cách.' });
    }
    if (password !== confirmPassword) {
      logger.warn('Đăng ký thất bại: Mật khẩu xác nhận không khớp');
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
    }
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
    // Kiểm tra email hợp lệ
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      logger.warn('Đăng nhập thất bại: Email không hợp lệ');
      return res.status(400).json({ success: false, message: 'Email phải là Gmail hợp lệ, không dấu cách.' });
    }
    if (email.length > 255) {
      logger.warn('Đăng nhập thất bại: Email vượt quá 255 ký tự');
      return res.status(400).json({ success: false, message: 'Email tối đa 255 ký tự.' });
    }
    // Kiểm tra password hợp lệ
    if (password.length < 6 || password.length > 255) {
      logger.warn('Đăng nhập thất bại: Mật khẩu không hợp lệ');
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 6 đến 255 ký tự.' });
    }
    if (password.includes(' ')) {
      logger.warn('Đăng nhập thất bại: Mật khẩu chứa dấu cách');
      return res.status(400).json({ success: false, message: 'Mật khẩu không được chứa dấu cách.' });
    }
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Đăng nhập thất bại: Không tìm thấy email');
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }
    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Đăng nhập thất bại: Sai mật khẩu');
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }
    // Sinh token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
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
    const { userId, newPassword, confirmPassword } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!userId || !newPassword || !confirmPassword) {
      logger.warn('Đổi mật khẩu thất bại: Thiếu trường bắt buộc');
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    // Kiểm tra mật khẩu hợp lệ
    if (newPassword.length < 6 || newPassword.length > 255) {
      logger.warn('Đổi mật khẩu thất bại: Mật khẩu không hợp lệ');
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 6 đến 255 ký tự.' });
    }
    if (newPassword.includes(' ')) {
      logger.warn('Đổi mật khẩu thất bại: Mật khẩu chứa dấu cách');
      return res.status(400).json({ success: false, message: 'Mật khẩu không được chứa dấu cách.' });
    }
    if (newPassword !== confirmPassword) {
      logger.warn('Đổi mật khẩu thất bại: Mật khẩu xác nhận không khớp');
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp.' });
    }
    // Tìm user theo userId
    const user = await User.findById(userId);
    if (!user) {
      logger.warn('Đổi mật khẩu thất bại: Không tìm thấy user');
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
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