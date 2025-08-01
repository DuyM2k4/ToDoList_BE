import User from '../models/User';
import bcrypt from 'bcrypt';
import { NAME_REGEX, NAME_MAX_LENGTH, EMAIL_REGEX, EMAIL_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "../constants/auth";

let existingUser: any;
let isMatch: boolean;

export type AuthFields = {
  userId?: string;
  name?: string;
  email?: string;
  password: string;
  confirmPassword?: string;
};

export async function validateAuthFields(fields: AuthFields): Promise<{ userId?: string; success: boolean; message: string; user?: any; match?: boolean}> {
  if (fields.name !== undefined) {
    if (!NAME_REGEX.test(fields.name)) return { success: false, message: "Tên chỉ được chứa ký tự chữ, số và dấu cách." };
    if (fields.name.length > NAME_MAX_LENGTH) return { success: false, message: `Tên tối đa ${NAME_MAX_LENGTH} ký tự.` };
  }

  if (fields.email !== undefined) {
    if (!EMAIL_REGEX.test(fields.email)) return { success: false, message: "Email không hợp lệ." };
    if (fields.email.length > EMAIL_MAX_LENGTH) return { success: false, message: `Email tối đa ${EMAIL_MAX_LENGTH} ký tự.` };
  }

  if (fields.password !== undefined) {
    if (fields.password.length < PASSWORD_MIN_LENGTH || fields.password.length > PASSWORD_MAX_LENGTH)
      return { success: false, message: `Mật khẩu phải từ ${PASSWORD_MIN_LENGTH} đến ${PASSWORD_MAX_LENGTH} ký tự.` };
    if (fields.password.includes(" ")) return { success: false, message: "Mật khẩu không được chứa dấu cách." };
  }

  if (fields.confirmPassword !== undefined){
    if (fields.password !== fields.confirmPassword) {
      return { success: false, message: `Mật khẩu xác nhận không khớp.` };
    }
  }

  if (fields.email !== undefined) {
    existingUser = await User.findOne({ email: fields.email });
    if (existingUser){
      // So sánh mật khẩu
      isMatch = await bcrypt.compare(fields.password, existingUser.password);
    }
  }

  if (fields.userId !== undefined){
    existingUser = await User.findById(fields.userId); 
  }

  return Promise.resolve({ success: true, message: "Hợp lệ", user: existingUser, match: isMatch});
}
