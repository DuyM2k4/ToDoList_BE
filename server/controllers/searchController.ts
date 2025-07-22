import { Request, Response } from "express";
import { Types } from "mongoose";
import Todo, { ITodo } from "../models/Todo";
import { logger } from "../utils/logger";

export const searchTodos = async (req: Request, res: Response) => {
    try {
        // Xác thực người dùng
        const userId = new Types.ObjectId(req.userId);
        if (!userId) {
            logger.warn("Lấy danh sách công việc thất bại: Truy cập trái phép");
            return res.status(401).json({
                success: false,
                message: "Không có quyền truy cập",
            });
        } else {
            const titleRequest: string = req.body.title;
            const isCompleted: string = req.body.isCompleted;

            let query: Record<string, any> = {
                user: userId,
            };

            // Nội dung todos cần tìm kiếm
            if (titleRequest.trim() !== "") {
                query["title"] = { $regex: titleRequest.trim(), $options: "i" };
            }

            // Trạng thái của todos cần tìm
            if (isCompleted) {
                if (isCompleted == "true") {
                    query["isCompleted"] = true;
                } else if (isCompleted == "false") {
                    query["isCompleted"] = false;
                }
            }

            const todos: ITodo[] = await Todo.find(query);

            logger.info(
                `Đã tìm thấy ${todos.length} công việc cho user: ${userId}`
            );

            // Nếu không có kết quả nào phù hợp thì trả về status 204
            if (todos.length == 0) {
                return res.sendStatus(204);
            }

            return res.status(200).json({ success: true, todos });
        }
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server errol",
        });
    }
};
