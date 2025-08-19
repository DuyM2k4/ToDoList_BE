import { Request, Response } from "express";
import { Types } from "mongoose";
import Todo, { ITodo } from "../models/Todo";
import logger from '../utils/logger';
import { ResponseInf, responseMessage } from "../utils/response";
import { todo } from "node:test";

export const searchTodos = async (req: Request, res: Response) => {
    try {
        // Checking user based on token
        if (!req.userId) {
            logger.warn("Lấy danh sách công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);

        } else {
            const userId = new Types.ObjectId(req.userId);
            const titleRequest: string = req.body.title;
            const isCompleted: string = req.body.isCompleted;

            let query: Record<string, any> = {
                user: userId,
            };

            // Content to search
            if (titleRequest && titleRequest.trim() !== "") {
                query["title"] = { $regex: titleRequest.trim(), $options: "i" };
            }

            // Check status of todo to search
            if (isCompleted) {
                if (isCompleted == "true") {
                    query["isCompleted"] = true;
                } else if (isCompleted == "false") {
                    query["isCompleted"] = false;
                }
            }

            const todos: ITodo[] = await Todo.find(query);

            logger.info(
                `Đã tìm thấy ${todos.length} kết quả cho tìm kiếm của user: ${userId}`
            );

            //  Return status 204 if the search return nothing
            if (todos.length == 0) {
                return res.sendStatus(204);
            } else {
                return ResponseInf.success<ITodo[]>(res, 200, `Đã tìm thấy ${todos.length} kết quả`, todos)
            }
        }
    } catch (error: any) {
        logger.error(error);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR)
    }
};