import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import todoRoutes from './routes/todo';
import { MONGO_URI } from './constants/db';
import ngrok from 'ngrok';
import { logger } from './utils/logger';

// Load biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình middleware
app.use(cors());
app.use(express.json());

// Cấu hình route
app.use('/auth', authRoutes);
app.use('/', todoRoutes);

// Kết nối MongoDB và khởi động server
mongoose.connect(MONGO_URI)
  .then(async () => {
    logger.info('Kết nối MongoDB thành công');
    app.listen(PORT, async () => {
      logger.info(`Server đang chạy tại http://localhost:${PORT}`);
      try {
        const url = await ngrok.connect(Number(PORT));
        logger.info(`Ngrok đang chạy tại: ${url}`);
      } catch (err) {
        logger.error('Lỗi khi khởi động Ngrok: ' + err);
      }
    });
  })
  .catch((err) => {
    logger.error('Lỗi kết nối MongoDB: ' + err);
  }); 