import mongoose, { Document, Schema } from 'mongoose';

// Interface tài liệu Todo
export interface ITodo extends Document {
  user: mongoose.Types.ObjectId; // Tham chiếu đến user sở hữu công việc
  title: string;                // Tiêu đề công việc
  description: string;          // Mô tả công việc
  isCompleted: boolean;         // Trạng thái hoàn thành
  createdAt: number;            // Timestamp tạo (Unix timestamp)
  updatedAt: number;            // Timestamp cập nhật cuối (Unix timestamp)
  dueDate?: number;             // Hạn hoàn thành (Unix timestamp, optional)
}

// Định nghĩa schema cho Todo
const todoSchema = new Schema<ITodo>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    default: '',
    trim: true
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  createdAt: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Number,
    required: true
  },
  dueDate: { 
    type: Number // Lưu Unix timestamp
  }
}); 

// Model Todo
const Todo = mongoose.model<ITodo>('Todo', todoSchema);

export default Todo;