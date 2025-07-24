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

// Update todo 
export const updateTodo = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const {id} = req.params;
        const { title, description, isCompleted, dueDate } = req.body;
        const updateData: Record<string, any> = {};

        if (!userId) {
            logger.warn("Cập nhật công việc thất bại: Truy cập trái phép");
            return res
                .status(401)
                .json({ success: false, message: "Không có quyền truy cập" });
        }

        if (!id) {
            logger.warn("Cập nhật công việc thất bại: Truy cập trái phép");
            return res
                .status(401)
                .json({ success: false, message: "Không tồn tại" });
        }

        // Tìm todo muốn cập nhật
        const todo = await Todo.findById(id);

        if (!todo) {
            logger.warn("Cập nhật công việc thất bại: Truy cập trái phép");
            return res
                .status(401)
                .json({ success: false, message: "Không tồn tại" });
        }
        
        // Xét điều kiện từng đầu vào
        if (title !== undefined) {
            if (title.length >= 255) {
                return res.status(400).json({
                    success: false,
                    message: "Tiêu đề (title) vượt quá 255 ký tự"
                });
            }
            updateData.title = title;
        }

        if (description !== undefined) {
            if (description.length >= 255) {
                return res.status(400).json({
                    success: false,
                    message: "Mô tả (description) vượt quá 255 ký tự"
                });
            }
            updateData.description = description;
        }

        if (isCompleted !== undefined) {
            console.log("ID cần tìm:", isCompleted);

            if (isCompleted === 'true' || isCompleted === 'false') {
                updateData.isCompleted = isCompleted;
            } 
            else {
                return res.status(400).json({
                    success: false,
                    message: "Completed truyền không hợp lệ"
                });
            };
            
        }

        if (dueDate !== undefined) {
            if (isNaN(Date.parse(dueDate))) {
                return res.status(400).json({
                    success: false,
                    message: "Ngày đến hạn (dueDate) không hợp lệ"
                });
            }
            updateData.dueDate = new Date(dueDate);
        }

        // Kiểm tra có dũ liệu để cập nhật không
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
        }

        // Kiểm tra đúng chủ sở hữu hoặc admin (quyền cập nhật)
        //TODO
        // if (userId === todo.user || userId === "ADMIN") {
            // ...
            
            // Cập nhật user cuối cùng chỉnh sửa công việc
            // TODO
            // updateData.updateBy = updateByUser;
        // };

        const updatedTodo = await Todo.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        logger.info(`Cập nhật công việc thành công, user ${userId}: ${id}`);
        return res.status(200).json({
            success: true,
            message: "Cập nhật công việc thành công",
            data: updatedTodo,
        });

    } catch (error: any) {
        logger.error("Lỗi cập nhật danh sách công việc: " + error.message);
        return res
            .status(500)
            .json({ success: false, message: "Lỗi máy chủ." });
    }
    
}
