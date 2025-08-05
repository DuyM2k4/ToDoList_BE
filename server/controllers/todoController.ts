import { Request, Response } from "express";
import Todo, { ITodo } from "../models/Todo";
import { logger } from "../utils/logger";
import { ResponseInf, responseMessage } from "../utils/response";

// Controller lấy tất cả todo của người dùng đã xác thực
export const getTodos = async (req: Request, res: Response) => {
    try {
        // Lấy userId từ request (được gán bởi middleware verifyToken)
        const userId = req.userId;
        if (!userId) {
            logger.warn("Lấy danh sách công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);
        }
        
        // Tìm tất cả todo của user, sắp xếp theo ngày tạo mới nhất
        const todos = await Todo.find({ user: userId }).sort({ createdAt: -1 });
        logger.info(`Đã lấy ${todos.length} công việc cho user: ${userId}`);
        
        return ResponseInf.success<ITodo[]>(res, 200, responseMessage.TODO.FETCH_SUCCESS, todos)

    } catch (error: any) {
        logger.error("Lỗi lấy danh sách công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};

// Controller thêm công việc mới
export const createTodo = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            logger.warn("Thêm công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);
        }

        const { title, description } = req.body;
        let { dueDate } = req.body;

        if (!title) {
            return ResponseInf.failed(res, 400, "Tiêu đề là bắt buộc");
        }

        if (title.length > 255) {
            return ResponseInf.failed(res, 400, "Tiêu đề không được vượt quá 255 ký tự");
        }

        if (description && description.length > 255) {
            return ResponseInf.failed(res, 400, "Mô tả không được vượt quá 255 ký tự");
        }

        // Xử lý dueDate
        const currentTimestamp = Date.now();

        if (dueDate && dueDate !== null && dueDate !== "") {
            if (dueDate < currentTimestamp) {
                return ResponseInf.failed(res, 400, "Ngày đến hạn (dueDate) phải là hôm nay hoặc sau hôm nay");
            }
        }

        if (dueDate === undefined || dueDate === null) {
            dueDate = "";
        }
        
        const newTodo = new Todo({
            title,
            description,
            dueDate: dueDate,
            user: userId,
            isCompleted: false,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });

        await newTodo.save();
        logger.info(`Thêm công việc mới cho user: ${userId}`);
        
        // Trả về todo trực tiếp không cần chuyển đổi
        return ResponseInf.success(res, 201, responseMessage.TODO.CREATED, newTodo.toObject());

    } catch (error: any) {
        logger.error("Lỗi thêm công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
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
            return ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);
        }

        if (!id) {
            logger.warn("Cập nhật công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.TODO.NOT_FOUND);
        }

        // Tìm todo muốn cập nhật
        const todo = await Todo.findById(id);

        if (!todo) {
            logger.warn("Cập nhật công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.TODO.NOT_FOUND);
        }
        
        // Xét điều kiện từng đầu vào
        if (title !== null && title !== undefined) {
            if (title.length >= 255) {
                return ResponseInf.failed(res, 400, "Tiêu đề (title) vượt quá 255 ký tự");
            }
            updateData.title = title;
        }

        if (description !== null && description !== undefined) {
            if (description.length >= 255) {
                return ResponseInf.failed(res, 400, "Mô tả (description) vượt quá 255 ký tự");
            }
            updateData.description = description;
        }

        if (isCompleted !== null && isCompleted !== undefined) {
            if (isCompleted === 'true' || isCompleted === 'false' || typeof isCompleted === 'boolean') {
                updateData.isCompleted = isCompleted === 'true' || isCompleted === true;
            } else {
                return ResponseInf.failed(res, 400, "Completed truyền không hợp lệ");
            }
        }

        const currentTimestamp = Date.now();
        if (dueDate !== null && dueDate !== undefined) {
            if (dueDate === "") {
                // Nếu gửi chuỗi rỗng thì set null
                updateData.dueDate = null;
            } else {
                if (dueDate < currentTimestamp) {
                    return ResponseInf.failed(res, 400, "Ngày đến hạn (dueDate) phải là hôm nay hoặc sau hôm nay");
                }
                updateData.dueDate = dueDate;
            }
        }

        // Kiểm tra có dữ liệu để cập nhật không
        if (Object.keys(updateData).length === 0) {
            return ResponseInf.failed(res, 400, "Không có dữ liệu để cập nhật");
        }

        updateData.updatedAt = currentTimestamp;

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
        
        // Trả về todo trực tiếp không cần chuyển đổi timestamp
        return ResponseInf.success(res, 200, responseMessage.TODO.UPDATED);

    } catch (error: any) {
        logger.error("Lỗi cập nhật danh sách công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};

// Xoá todo theo id
export const deleteTodo = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const todoId = req.params.id;
        if (!userId) {
            logger.warn("Xoá công việc thất bại: Truy cập trái phép");
            return ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);
        }

        const todo = await Todo.findOneAndDelete({ _id: todoId, user: userId });
        if (!todo) {
            logger.warn(`Không tìm thấy hoặc không có quyền xoá todo với id: ${todoId}`);
            return ResponseInf.failed(res, 404, responseMessage.TODO.NOT_FOUND);
        }

        logger.info(`Đã xoá todo với id: ${todoId} cho user: ${userId}`);

        return ResponseInf.success(res, 200, responseMessage.TODO.DELETED);

    } catch (error: any) {
        logger.error("Lỗi xoá công việc: " + error.message);
        return ResponseInf.failed(res, 500, responseMessage.COMMON.INTERNAL_SERVER_ERROR);
    }
};
