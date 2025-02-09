export default class Category {
    id!: number;  // Auto-incremented primary key in MySQL
    userId!: number;  // Foreign key reference to User
    name!: string;  // Default: "Uncategorized"
    type!: "income" | "expense";  // Enum type
    createdAt!: Date;  // Automatically handled by Prisma
    updatedAt!: Date;  // Automatically updated
}