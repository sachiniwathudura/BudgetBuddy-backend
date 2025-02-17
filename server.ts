import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import cors from "cors";
import errorHandler from "./middlewares/errorHandlerMiddleware";
import categoryRouter from "./routes/categoryRouter";
import transactionRouter from "./routes/transactionRouter";

dotenv.config();
const app = express();

//! Cors config
app.use(
    cors({
        origin: "http://localhost:5175",
    })
);

//! Middlewares
app.use(express.json()); // Pass incoming JSON data

//! Routes
app.use(userRouter);
app.use(categoryRouter);
app.use(transactionRouter);

//! Error handler
app.use(errorHandler);

// Start server
app.listen(8000, () => {
    console.log("Server running on port 8000");
});
