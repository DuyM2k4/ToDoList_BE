import { Request } from "express";

export function getLogMetadata(req: Request): string {
    return `[${req.method} ${req.originalUrl}]`
}