import mongoose, { Document, Schema } from 'mongoose';

// Interface tài liệu User
export interface IUser extends Document {
  name: string;    // Họ tên người dùng
  email: string;   // Địa chỉ email (phải là Gmail)
  password: string;// Mật khẩu đã mã hóa
}

// Định nghĩa schema cho User
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    maxlength: 255,
    match: [/^[a-zA-Z0-9 ]+$/, 'Tên chỉ được chứa ký tự chữ, số và dấu cách'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email phải là Gmail hợp lệ'],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
});

// Model User
const User = mongoose.model<IUser>('User', userSchema);
export default User; 