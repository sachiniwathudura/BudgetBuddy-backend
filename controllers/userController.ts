
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { User } from "../model/User";

const prisma = new PrismaClient();

const usersController = {
    //! Register
    register: asyncHandler(async (req: Request, res: Response) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({
                status: "error",
                message: "All fields are required",
            });
            return; // Ensure the function exits after sending the response
        }

        //! Check if user already exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({
                status: "error",
                message: "User already exists",
            });
            return;
        }

        //! Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //! Create and save user
        const user: User = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: { id: user.id, username: user.username, email: user.email },
        });
    }),

    //! Login
    login: asyncHandler(async (req:Request, res: Response) => {
        const { email, password } = req.body;

        //! Find user by email
        const user: User | null = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({
                status: "error",
                message: "Invalid login credentials",
            });
            return;
        }

        //! Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                status: "error",
                message: "Invalid login credentials",
            });
            return;
        }

        //! Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY || "defaultKey", {
            expiresIn: "30d",
        });

        res.json({
            status: "success",
            message: "Login Successful",
            token,
            user: { id: user.id, email: user.email, username: user.username },
        });
    }),

    //! Profile
    profile: asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
            return;
        }

        //! Find user
        const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });
            return;
        }

        res.json({
            status: "success",
            data: { username: user.username, email: user.email },
        });
    }),

    //! Change Password
    changeUserPassword: asyncHandler(async (req:Request, res: Response) => {
        const userId = (req as any).user?.id;
        const { newPassword } = req.body;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
            return;
        }

        //! Find user
        const user: User | null = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
            });
            return;
        }

        //! Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //! Update user password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({
            status: "success",
            message: "Password changed successfully",
        });
    }),
    //! Update User Profile
    updateUserProfile: asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user?.id;
        const { username, email } = req.body;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });
            return;
        }

        //! Update user fields
        const user: User = await prisma.user.update({
            where: { id: userId },
            data: { username, email },
        });

        res.json({
            status: "success",
            message: "User profile updated successfully",
            user,
        });
    }),
};

export default usersController;