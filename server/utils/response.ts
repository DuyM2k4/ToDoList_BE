import { Response } from 'express';


class ResponseInf {
    static success<T = undefined>(res: Response, code: number, message: string, data?: T) {
        const responseData = {
            success: true,
            message,
            ...(data && { data }),
        };
        return res.status(code).json(responseData);
    };

    static failed(res: Response, code: number, message: string) {
        const responseData = {
            success: false,
            message,
        };

        return res.status(code).json(responseData);
    };
};


const responseMessage = {
    AUTH: {
        CREATED: "Đăng ký thành công",
        LOGIN_SUCCESS: "Đăng nhập thành công",
        PASSWORD_CHANGED: "Đổi mật khẩu thành công",
        EXISTED_EMAIL: "Email đã được sử dụng",
        INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng",
        USER_NOT_FOUND: "Không tìm thấy người dùng",
        UNAUTHORIZED: "Không có quyền truy cập",
    },

    TODO: {
        CREATED: 'Tạo todo thành công',
        UPDATED: 'Cập nhật todo thành công',
        DELETED: 'Xóa todo thành công',
        NOT_FOUND: 'Không tìm thấy todo',
        FETCH_SUCCESS: 'Lấy danh sách todo thành công'
    },

    TOKEN: {
        MISSING_AUTHORIZATION: "Không tìm thấy trường Authorization trong header",
        TOKEN_NOT_FOUND: "Không tìm thấy access token",
        MISSING_USERID: "Token không hợp lệ (thiếu userId)",
        INVALID_TOKEN: "Token không hợp lệ",
        TOKEN_EXPIRED: "Token đã hết hạn. Vui lòng đăng nhập lại",
    },

    COMMON: {
        INTERNAL_SERVER_ERROR: "Lỗi máy chủ",
        MISSING_FIELDS: "Vui lòng nhập đầy đủ thông tin",
    },
};


export { ResponseInf, responseMessage };