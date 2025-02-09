export default class Transaction {
    id!: number;  // Auto-incremented primary key in MySQL
    userId!: number;  // Foreign key reference to User
    categoryId!: number;  // Foreign key reference to Category
    type!: "income" | "expense";  // Enum type
    amount!: number;  // Decimal value
    date!: Date;  // Default to current date
    description?: string;  // Optional field
    createdAt!: Date;  // Automatically handled by Prisma
    updatedAt!: Date;  // Automatically updated
}