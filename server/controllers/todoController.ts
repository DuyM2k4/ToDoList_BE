import { Request, Response } from "express";
import Todo, { ITodo } from "../models/Todo";
import logger from '../utils/logger';
import { ResponseInf, responseMessage } from "../utils/response";
import { requireAuth } from "../utils/checkAuth";
import { validateTodoInput } from "../utils/todoValidator";
import { buildUpdateData } from "../utils/buildUpdateData";

// Lấy tất cả todo
export const getTodos = async (req: Request, res: Response) => {
    try {
        if (!requireAuth(req.userId, res)) return;

        const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
        logger.info(`Đã lấy ${todos.length} công việc cho user: ${req.userId}`);
        
        return ResponseInf.success<ITodo[]>(res, 200, responseMessage.TODO.FETCH_SUCCESS, todos);
    } catch (error: any) {
        logger.error("Lỗi lấy danh sách công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};

// Thêm todo
export const createTodo = async (req: Request, res: Response) => {
    try {
        if (!requireAuth(req.userId, res)) return;

        const { title, description, dueDate } = req.body;
        if (!title) return ResponseInf.failed(res, 400, "Tiêu đề là bắt buộc");
        if (!validateTodoInput(res, { title, description, dueDate })) return;

        const newTodo = new Todo({
            title,
            description,
            dueDate: dueDate || "",
            user: req.userId,
            isCompleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        await newTodo.save();
        logger.info(`Thêm công việc mới cho user: ${req.userId}`);
        
        return ResponseInf.success(res, 201, responseMessage.TODO.CREATED, newTodo.toObject());
    } catch (error: any) {
        logger.error("Lỗi thêm công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};

// Cập nhật todo
export const updateTodo = async (req: Request, res: Response) => {
    try {
        if (!requireAuth(req.userId, res)) return;

        const { id } = req.params;
        if (!id) return ResponseInf.failed(res, 400, responseMessage.TODO.NOT_FOUND);

        const todo = await Todo.findById(id);
        if (!todo) return ResponseInf.failed(res, 404, responseMessage.TODO.NOT_FOUND);

        const updateData = buildUpdateData(req.body);
        if (!validateTodoInput(res, updateData)) return;
        
        if (Object.keys(updateData).length === 1 && updateData.updatedAt) {
            return ResponseInf.failed(res, 400, "Không có dữ liệu để cập nhật");
        }

        const updatedTodo = await Todo.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        logger.info(`Cập nhật công việc thành công, user ${req.userId}: ${id}`);
        
        return ResponseInf.success(res, 200, responseMessage.TODO.UPDATED, updatedTodo);
    } catch (error: any) {
        logger.error("Lỗi cập nhật công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};

// Xoá todo
export const deleteTodo = async (req: Request, res: Response) => {
    try {
        if (!requireAuth(req.userId, res)) return;

        const todoId = req.params.id;
        const todo = await Todo.findOneAndDelete({ _id: todoId, user: req.userId });

        if (!todo) {
            logger.warn(`Không tìm thấy hoặc không có quyền xoá todo với id: ${todoId}`);
            return ResponseInf.failed(res, 404, responseMessage.TODO.NOT_FOUND);
        }

        logger.info(`Đã xoá todo với id: ${todoId} cho user: ${req.userId}`);
        return ResponseInf.success(res, 200, responseMessage.TODO.DELETED);
    } catch (error: any) {
        logger.error("Lỗi xoá công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};
