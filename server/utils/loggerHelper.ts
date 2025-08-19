import { Request } from "express";

// Get info endpoint
export function getLogMetadata(req: Request): string {
    return `[${req.method} ${req.originalUrl}]`
}

//Example
// import { getLogMetadata } from "../utils/loggerHelper";

// logger.info(`Thêm công việc mới cho user: ${userId}`, {endpoint: getLogMetadata(req)});