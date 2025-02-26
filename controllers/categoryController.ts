import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient, CategoryType } from "@prisma/client";
import {Category} from "../model/Category"; // Import CategoryType enum

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: { id: string };
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

        const category:Category = await prisma.category.create({
            data: {
                name: normalizedName,
                type: type.toLowerCase() as CategoryType, // ✅ Cast type to Prisma's CategoryType
                userId: userId, // ✅ Use number for userId
            },
        });

        res.status(201).json(category);
    }),
    //! List categories
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

    //!update category
    update: asyncHandler(async (req: AuthRequest, res: Response) => {
        const { categoryId } = req.params;
        const { type, name }: { type?: string; name?: string } = req.body;

        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id); // Convert user ID to number

        // Check if category exists and belongs to the user
        const category:Category|null = await prisma.category.findUnique({
            where: { id: Number(categoryId) },
        });

        if (!category || category.userId !== userId) {
            res.status(404);
            throw new Error("Category not found or user not authorized");
        }

        // Validate category type
        const validTypes: string[] = ["income", "expense"];
        if (type && !validTypes.includes(type.toLowerCase())) {
            throw new Error(`Invalid category type: ${type}`);
        }

        // Prepare updated data
        const updatedData: { name?: string; type?: CategoryType } = {};
        if (name) updatedData.name = name.toLowerCase();
        if (type) updatedData.type = type.toLowerCase() as CategoryType;

        // Update category
        const updatedCategory = await prisma.category.update({
            where: { id: category.id },
            data: updatedData,
        });

        res.json(updatedCategory);
    }),
    //! Delete category
    delete: asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id); // Convert user ID to number
        const categoryId = Number(req.params.id); // Convert category ID to number

        // Check if category exists and belongs to the user
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category || category.userId !== userId) {
            res.status(404);
            throw new Error("Category not found or user not authorized");
        }

        // Define a default category name for reassignment
        const defaultCategoryName = "Uncategorized";

        // Check if an "Uncategorized" category exists for the user
        let defaultCategory = await prisma.category.findFirst({
            where: { name: defaultCategoryName, userId: userId },
        });

        // If no default category exists, create one
        if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
                data: {
                    name: defaultCategoryName,
                    type: "expense", // Default type, adjust if necessary
                    userId: userId,
                },
            });
        }

        // Update transactions associated with the deleted category
        await prisma.transaction.updateMany({
            where: { userId: userId, categoryId: categoryId },
            data: { categoryId: defaultCategory.id }, // Assign to "Uncategorized"
        });

        // Delete the category
        await prisma.category.delete({ where: { id: categoryId } });

        res.json({ message: "Category deleted and transactions reassigned" });
    }),



};

export default categoryController;