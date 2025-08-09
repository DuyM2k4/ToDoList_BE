import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { validateAuthFields } from '../utils/authUtils';
import { ResponseInf, responseMessage } from "../utils/response";

// Register a new user
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      logger.warn('Đăng ký thất bại: Thiếu trường bắt buộc');
      return ResponseInf.failed(res, 400, responseMessage.COMMON.MISSING_FIELDS);
    }

    // Validate input fields
    const validateResult = await validateAuthFields({ name, email, password, confirmPassword });
    if (!validateResult.success) {
      logger.warn('Đăng ký thất bại: ' + validateResult.message);
      return ResponseInf.failed(res, 400, validateResult.message);
    }

    // Check if email already exists
    else if (validateResult.user) {
      logger.warn('Đăng ký thất bại: Email đã tồn tại');
      return ResponseInf.failed(res, 409, responseMessage.AUTH.EXISTED_EMAIL);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    logger.info(`Đăng ký thành công cho email: ${email}`);

    return ResponseInf.success(res, 201, responseMessage.AUTH.CREATED);

  } catch (error: any) {
    logger.error('Lỗi đăng ký: ' + error.message);
    return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
  }
};

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      logger.warn('Đăng nhập thất bại: Thiếu email hoặc mật khẩu');
      return ResponseInf.failed(res, 400, responseMessage.COMMON.MISSING_FIELDS);
    }

    // Validate input fields
    const validateResult = await validateAuthFields({ email, password });
    if (!validateResult.success) {
      logger.warn('Đăng nhập thất bại: ' + validateResult.message);
      return ResponseInf.failed(res, 400, validateResult.message);
    }

    // Check if user exists and password matches
    else if (!validateResult.user || !validateResult.match) {
      logger.warn('Đăng nhập thất bại: Email hoặc mật khẩu không đúng');
      return ResponseInf.failed(res, 401, responseMessage.AUTH.INVALID_CREDENTIALS);
    }

    // Assign user
    const user = validateResult.user;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    logger.info(`Đăng nhập thành công cho email: ${email}`);

    return ResponseInf.success(res, 200, responseMessage.AUTH.LOGIN_SUCCESS, {
      name: user.name,
      email: user.email,
      user_ID: user._id,
      token
    })

  } catch (error: any) {
    logger.error('Lỗi đăng nhập: ' + error.message);
    return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
  }
};

// Change user password
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Get userId from verifyToken middleware
    const userId = req.userId;
    const { newPassword, confirmPassword } = req.body;

    // Check required fields
    if (!userId || !newPassword || !confirmPassword) {
      logger.warn('Đổi mật khẩu thất bại: Thiếu trường bắt buộc');
      return ResponseInf.failed(res, 400, responseMessage.COMMON.MISSING_FIELDS);
    }

    // Validate new password
    const validateResult = await validateAuthFields({ userId, password: newPassword, confirmPassword });
    if (!validateResult.success) {
      logger.warn('Đổi mật khẩu thất bại: ' + validateResult.message);
      return ResponseInf.failed(res, 400, validateResult.message)
    }

    // Check if user exists
    else if (!validateResult.user) {
      logger.warn('Đổi mật khẩu thất bại: Không tìm thấy user');
      
      return ResponseInf.failed(res, 404, responseMessage.AUTH.USER_NOT_FOUND)
    }

    // Assign user
    const user = validateResult.user;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    logger.info(`Đổi mật khẩu thành công cho user: ${userId}`);

    return ResponseInf.success(res, 200, responseMessage.AUTH.PASSWORD_CHANGED);

  } catch (error: any) {
    logger.error('Lỗi đổi mật khẩu: ' + error.message);
    return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
  }
};