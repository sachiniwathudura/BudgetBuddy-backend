import express, {NextFunction} from "express";
import { Request, Response } from "express";
import categoryController from "../controllers/categoryController";
import isAuthenticated from "../middlewares/Auth";

const categoryRouter = express.Router();

//! Add Category
categoryRouter.post(
    "/api/v1/categories/create",
    isAuthenticated,
    (req: Request, res: Response,next: NextFunction) => categoryController.create(req, res,next)
);
//
//! List Categories
categoryRouter.get(
    "/api/v1/categories/lists",
    isAuthenticated,
    (req: Request, res: Response,next: NextFunction) => categoryController.lists(req, res,next)
);

//! Update Category
categoryRouter.put(
    "/api/v1/categories/update/:categoryId",
    isAuthenticated,
    (req: Request, res: Response,next: NextFunction) => categoryController.update(req, res,next)
);
//
// //! Delete Category
// categoryRouter.delete(
//     "/api/v1/categories/delete/:id",
//     isAuthenticated,
//     (req: Request, res: Response,next: NextFunction) => categoryController.delete(req, res,next)
// );

export default categoryRouter;