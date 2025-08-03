import User from '../models/User';
import bcrypt from 'bcrypt';
import {
  NAME_REGEX,
  NAME_MAX_LENGTH,
  EMAIL_REGEX,
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH
} from "../constants/auth";

let existingUser: any;
let isMatch: boolean;

export type AuthFields = {
  userId?: string;
  name?: string;
  email?: string;
  password: string;
  confirmPassword?: string;
};

export async function validateAuthFields(fields: AuthFields): Promise<{
  userId?: string;
  success: boolean;
  message: string;
  user?: any;
  match?: boolean;
}> {
  
  // Validate name (if provided)
  if (fields.name !== undefined) {
    if (!NAME_REGEX.test(fields.name)) return { success: false, message: "Tên chỉ được chứa ký tự chữ, số và dấu cách." };
    if (fields.name.length > NAME_MAX_LENGTH) return { success: false, message: `Tên tối đa ${NAME_MAX_LENGTH} ký tự.` };
  }

  // Validate email (if provided)
  if (fields.email !== undefined) {
    if (!EMAIL_REGEX.test(fields.email)) return { success: false, message: "Email không hợp lệ." };
    if (fields.email.length > EMAIL_MAX_LENGTH) return { success: false, message: `Email tối đa ${EMAIL_MAX_LENGTH} ký tự.` };
  }

  // Validate password (if provided)
  if (fields.password !== undefined) {
    if (fields.password.length < PASSWORD_MIN_LENGTH || fields.password.length > PASSWORD_MAX_LENGTH)
      return { success: false, message: `Mật khẩu phải từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.` };
    if (fields.password.includes(" ")) return { success: false, message: "Mật khẩu không được chứa dấu cách." };
  }

  // Validate confirm password (if provided)
  if (fields.confirmPassword !== undefined) {
    if (fields.password !== fields.confirmPassword) {
      return { success: false, message: `Mật khẩu xác nhận không khớp.` };
    }
  }

  // Find user by email (if provided)
  if (fields.email !== undefined) {
    existingUser = await User.findOne({ email: fields.email });
    if (existingUser) {
      // Compare password if user exists
      isMatch = await bcrypt.compare(fields.password, existingUser.password);
    }
  }

  // Find user by userId (if provided)
  if (fields.userId !== undefined) {
    existingUser = await User.findById(fields.userId);
  }

  return Promise.resolve({ success: true, message: "Hợp lệ", user: existingUser, match: isMatch });
}
