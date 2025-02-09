declare namespace Express {
    export interface Request {
        user?: string; // This will hold the user id from the JWT token
    }
}