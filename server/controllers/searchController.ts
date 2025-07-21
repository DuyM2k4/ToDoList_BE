import { Request, Response } from "express";
import Todo, { ITodo } from "../models/Todo";
import { logger } from "../utils/logger";

export const searchTodos = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
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

            if (titleRequest.trim() !== "") {
                query["title"] = { $regex: titleRequest.trim(), $option: "i" };
            }
            if (isCompleted == "true") {
                query["isCompleted"] = true;
            }
            const todos: ITodo[] = await Todo.find(query);
            logger.info(
                `Đã tìm thấy ${todos.length} công việc cho user: ${userId}`
            );
            return res.status(200).json({ success: true, todos });
        }
    } catch (error: any) {
        logger.error("Error: " + error);
        res.status(500).json({ message: "Internal server errol" });
    }
};
