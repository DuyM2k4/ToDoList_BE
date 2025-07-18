import mongoose, { Document, Schema } from 'mongoose';

// Interface tài liệu Todo
export interface ITodo extends Document {
  user: mongoose.Types.ObjectId; // Tham chiếu đến user sở hữu công việc
  title: string;                // Tiêu đề công việc
  description: string;          // Mô tả công việc
  isCompleted: boolean;         // Trạng thái hoàn thành
  createdAt: Date;              // Thời điểm tạo
  updatedAt: Date;              // Thời điểm cập nhật cuối
  dueDate: Date;                // Hạn hoàn thành
}

// Định nghĩa schema cho Todo
const todoSchema = new Schema<ITodo>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Tham chiếu user
  title: { type: String, required: true },                            // Tiêu đề
  description: { type: String, default: '' },                         // Mô tả
  isCompleted: { type: Boolean, default: false },                     // Trạng thái hoàn thành
  dueDate: { type: Date },                                            // Hạn hoàn thành
}, { timestamps: true });                                             // Tự động quản lý createdAt/updatedAt

// Model Todo
const Todo = mongoose.model<ITodo>('Todo', todoSchema);
export default Todo; 