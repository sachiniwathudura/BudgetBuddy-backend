import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient, CategoryType } from "@prisma/client"; // Import CategoryType enum
import {Category} from "../model/Category";
const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: { id: string }; // Assuming the user ID is stored as a string
}

const categoryController = {
    create: asyncHandler(async (req: AuthRequest, res: Response) => {
        const { name, type }: { name: string; type: string } = req.body;

        if (!name || !type) {
            throw new Error("Name and type are required for creating a category");
        }

        const normalizedName: string = name.toLowerCase();
        const validTypes: string[] = ["income", "expense"];
        if (!validTypes.includes(type.toLowerCase())) {
            throw new Error(`Invalid category type: ${type}`);
        }

        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id); // ✅ Convert user ID to number

        const categoryExists = await prisma.category.findFirst({
            where: {
                name: normalizedName,
                userId: userId, // ✅ Use the converted number
            },
        });

        if (categoryExists) {
            throw new Error(`Category ${categoryExists.name} already exists`);
        }

        const category = await prisma.category.create({
            data: {
                name: normalizedName,
                type: type.toLowerCase() as CategoryType, // ✅ Cast type to Prisma's CategoryType
                userId: userId, // ✅ Use number for userId
            },
        });

        res.status(201).json(category);
    }),

    lists: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id); // Ensure userId is a number

        const categories = await prisma.category.findMany({
            where: { userId: userId }, // Fetch categories for the logged-in user
        });

        res.status(200).json(categories); // Return categories as JSON
    }),
};


export default categoryController;