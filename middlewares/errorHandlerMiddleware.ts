import { Request, Response, NextFunction } from "express";

interface ErrorResponse extends Error {
    statusCode?: number;
    stack?: string;
}

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: err.stack,
    });
};

export default errorHandler;

