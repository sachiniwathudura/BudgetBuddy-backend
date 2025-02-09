import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        //? Get the token from the header
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "No token provided" });
            return;
        }

        // //! Verify the token
        // const decoded = jwt.verify(token, "masynctechKey") as JwtPayload;
        //? Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "defaultKey") as JwtPayload;

        if (decoded) {
            //? Save the user req obj
            (req as any).user = decoded;
            next();
        } else {
            const err = new Error("Token expired, login again");
            next(err);
        }
    } catch (err) {
        next(err);
    }
};

export default isAuthenticated;
