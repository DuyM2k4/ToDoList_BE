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

// Xoá todo theo id
export const deleteTodo = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const todoId = req.params.id;
        if (!userId) {
            logger.warn("Xoá công việc thất bại: Truy cập trái phép");
            return res.status(401).json({ success: false, message: "Không có quyền truy cập" });
        }
        const todo = await Todo.findOneAndDelete({ _id: todoId, user: userId });
        if (!todo) {
            logger.warn(`Không tìm thấy hoặc không có quyền xoá todo với id: ${todoId}`);
            return res.status(404).json({ success: false, message: "Không tìm thấy công việc hoặc không có quyền xoá" });
        }
        logger.info(`Đã xoá todo với id: ${todoId} cho user: ${userId}`);
        return res.status(200).json({ success: true, message: "Đã xoá công việc thành công" });
    } catch (error: any) {
        logger.error("Lỗi xoá công việc: " + error.message);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ." });
    }
};
