import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient} from "@prisma/client"; // Assuming Prisma is being used
import {Transaction} from "../model/Transaction";


const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: { id: string };
}
class TransactionController {
    //! Create a transaction
    create = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const {type, categoryId, amount, date, description} = req.body;

        // Validate required fields
        if (!amount || !type || !date || !categoryId) {
            throw new Error("Type, amount, date, and categoryId are required");
        }
        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id); //
        // Ensure the date is in the correct ISO-8601 format
        const formattedDate = new Date(date).toISOString(); // Converts to ISO-8601 format

        // Create a new transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId, // Ensure userId is a number
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

    //! Get filtered transactions
    getFilteredTransactions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { startDate, endDate, type, category } = req.query;

        if (!req.user) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        const userId = Number(req.user.id);

        let filters: any = {
            userId:userId, // Ensure userId is a number
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
        const transactions= await prisma.transaction.findMany({
            where: filters,
            orderBy: { date: "desc" }, // Order by date in descending order
        });

        res.json(transactions);
    });

    //! Update transaction
    update = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { type, categoryId, amount, date, description } = req.body;

        if (!req.user) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        //! Find the transaction
        const transaction= await prisma.transaction.findUnique({
            where: { id: Number(id) }, // Ensure ID is a number
        });

        if (!transaction) {
            res.status(404);
            throw new Error("Transaction not found");
        }

        if (transaction.userId !== Number(req.user.id)) {
            res.status(403);
            throw new Error("Unauthorized to update this transaction");
        }

        //! Update fields
        const updatedTransaction= await prisma.transaction.update({
            where: { id: Number(id) },
            data: {
                type: type ?? transaction.type,
                categoryId: categoryId ?? transaction.categoryId,
                amount: amount ?? transaction.amount,
                date: date ? new Date(date).toISOString() : transaction.date,
                description: description ?? transaction.description,
            },
        });

        res.json(updatedTransaction);
    });


    //! Delete transaction
    delete = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        // const { id } = req.params;
        //
        if (!req.user || !req.user.id) {
            throw new Error("Unauthorized: User not found");
        }

        const userId = Number(req.user.id);
        const transactionId = Number(req.params.id);

        if (!req.user) {
            res.status(401);
            throw new Error("Unauthorized");
        }

        //! Find the transaction
        const transaction= await prisma.transaction.findUnique({
            where: { id: transactionId }, // Ensure ID is a number
        });

        if (!transaction) {
            res.status(404);
            throw new Error("Transaction not found");
        }

        if (transaction.userId !== userId) {
            res.status(403);
            throw new Error("Unauthorized to delete this transaction");
        }

        //! Delete transaction
        await prisma.transaction.delete({
            where: { id:transactionId},
        });

        res.json({ message: "Transaction removed successfully" });
    });




}

export default new TransactionController();
//transaction controller