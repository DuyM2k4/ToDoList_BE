import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { logger } from "../utils/logger";
import { ResponseInf, responseMessage } from "../utils/response";

// Extend Request interface to include userId
declare module "express-serve-static-core" {
    interface Request {
        userId?: string;
    }
}

/**
 * Middleware to validate JWT access token from the Authorization header.
 * If valid, assigns userId to the request and calls next().
 * If invalid or missing, returns a 401/403 error.
 */

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        logger.warn("Từ chối truy cập: Không có header Authorization");
        return ResponseInf.failed(res, 401, responseMessage.TOKEN.MISSING_AUTHORIZATION);
    }

    // Extract token from Authorization header
    const token = authHeader.split(" ")[1];
    if (!token) {
        logger.warn("Từ chối truy cập: Không có token");
        return ResponseInf.failed(res, 401, responseMessage.TOKEN.TOKEN_NOT_FOUND);
    }

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;

        // Check if decoded token contains valid userId
        if (typeof decoded !== "object" || !decoded.userId) {
            logger.error("Token không chứa userId hợp lệ");
            return ResponseInf.failed(res, 403, responseMessage.TOKEN.MISSING_USERID);
        }

        // Assign userId to request
        req.userId = decoded.userId;
        logger.info(`Xác thực token thành công cho user: ${decoded.userId}`);
        next();
    } catch (error) {
        // Handle token expired error
        if (error instanceof TokenExpiredError) {
            logger.error("Token đã hết hạn: " + error.message);
            return ResponseInf.failed(res, 401, responseMessage.TOKEN.TOKEN_EXPIRED);
        }

        // Handle invalid token error
        if (error instanceof JsonWebTokenError) {
            logger.error("Token không hợp lệ: " + error.message);
            return ResponseInf.failed(res, 403, responseMessage.TOKEN.INVALID_TOKEN);
        }

        // Handle unknown errors
        logger.error("Lỗi không xác định khi xác thực token: " + (error as Error).message);
        return ResponseInf.failed(res, 401, "Đã xảy ra lỗi khi xác thực token");
    }
};

export default verifyToken;
