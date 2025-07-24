import { Request, Response } from "express";
import Todo from "../models/Todo";
import { logger } from "../utils/logger";

// Controller lấy tất cả todo của người dùng đã xác thực
export const getTodos = async (req: Request, res: Response) => {
    try {
        // Lấy userId từ request (được gán bởi middleware verifyToken)
        const userId = req.userId;
        if (!userId) {
            logger.warn("Lấy danh sách công việc thất bại: Truy cập trái phép");
            return res
                .status(401)
                .json({ success: false, message: "Không có quyền truy cập" });
        }
        // Tìm tất cả todo của user, sắp xếp theo ngày tạo mới nhất
        const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
        logger.info(`Đã lấy ${todos.length} công việc cho user: ${userId}`);
        return res.status(200).json({ success: true, todos });
    } catch (error: any) {
        logger.error("Lỗi lấy danh sách công việc: " + error.message);
        return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ." });
    }
};

// Controller thêm công việc mới
export const createTodo = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            logger.warn("Thêm công việc thất bại: Truy cập trái phép");
            return res.status(401).json({ success: false, message: "Không có quyền truy cập" });
        }

        const { title, description, dueDate } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Tiêu đề là bắt buộc" });
        }

        if (title.length > 255) {
            return res.status(400).json({ success: false, message: "Tiêu đề không được vượt quá 255 ký tự" });
        }

        if (description && description.length > 255) {
            return res.status(400).json({ success: false, message: "Mô tả không được vượt quá 255 ký tự" });
        }

        const newTodo = new Todo({
            title,
            description,
            dueDate,
            user: userId,
            isCompleted: false,
        });

        await newTodo.save();
        logger.info(`Thêm công việc mới cho user: ${userId}`);
        return res.status(201).json({ success: true, todo: newTodo });
    } catch (error: any) {
        logger.error("Lỗi thêm công việc: " + error.message);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
};

