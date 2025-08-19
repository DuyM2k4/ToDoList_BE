import { Response } from "express";
import logger from "./logger";
import { ResponseInf, responseMessage } from "./response";

export function requireAuth(userId: string | undefined, res: Response): boolean {
    if (!userId) {
        logger.warn("Truy cập trái phép");
        ResponseInf.failed(res, 401, responseMessage.AUTH.UNAUTHORIZED);
        return false;
    }
    return true;
}
