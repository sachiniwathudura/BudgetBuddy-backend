import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient, Transaction } from "@prisma/client"; // Assuming Prisma is being used


const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: { id: string }; // Assuming the user ID is stored as a string
}
class TransactionController {
    // Create a transaction
    create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { type, categoryId, amount, date, description } = req.body;

        // Validate required fields
        if (!amount || !type || !date || !categoryId) {
            throw new Error("Type, amount, date, and categoryId are required");
        }

        // Ensure the date is in the correct ISO-8601 format
        const formattedDate = new Date(date).toISOString(); // Converts to ISO-8601 format

        // Create a new transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: Number(req.user?.id), // Ensure userId is a number
                type,
                categoryId, // Use categoryId instead of category name
                amount,
                description,
                date: formattedDate, // Use the formatted date
            },
        });

        // Send response with the created transaction
        res.status(201).json(transaction);
    });

    //!list
    getFilteredTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { startDate, endDate, type, category } = req.query;

        if (!req.user) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        let filters: any = {
            userId: Number(req.user.id), // Ensure userId is a number
        };

        // Handle date range filters
        if (startDate || endDate) {
            filters.date = {};
            if (startDate) {
                filters.date.gte = new Date(startDate as string);
            }
            if (endDate) {
                filters.date.lte = new Date(endDate as string);
            }
        }

        // Filter by transaction type if provided
        if (type) {
            filters.type = type;
        }

        // Handle category filtering
        if (category) {
            if (category === "Uncategorized") {
                filters.categoryId = null; // Filter for transactions with no category
            } else if (category !== "All") {
                filters.categoryId = Number(category); // Ensure category ID is a number
            }
        }

        // Fetch transactions with the applied filters
        const transactions = await prisma.transaction.findMany({
            where: filters,
            orderBy: { date: "desc" }, // Order by date in descending order
        });

        res.json(transactions);
    });
}

export default new TransactionController();