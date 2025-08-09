// utils/todoValidator.ts
import { Response } from "express";
import { ResponseInf } from "./response";

export function validateTodoInput(
    res: Response,
    { title, description, dueDate }: { title?: string; description?: string; dueDate?: number | string | null }
): boolean {
    if (title && title.length > 255) {
        ResponseInf.failed(res, 400, "Tiêu đề không được vượt quá 255 ký tự");
        return false;
    }
    if (description && description.length > 255) {
        ResponseInf.failed(res, 400, "Mô tả không được vượt quá 255 ký tự");
        return false;
    }

    const currentTimestamp = Date.now();
    if (dueDate && dueDate !== "" && +dueDate < currentTimestamp) {
        ResponseInf.failed(res, 400, "Ngày đến hạn (dueDate) phải là hôm nay hoặc sau hôm nay");
        return false;
    }
    return true;
}
