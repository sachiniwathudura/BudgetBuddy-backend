import express, { Request, Response } from "express";
import usersController from "../controllers/userController";
import isAuthenticated from "../middlewares/Auth";

const userRouter = express.Router();

//?Register
userRouter.post("/api/v1/users/register", usersController.register);

//?Login
userRouter.post("/api/v1/users/login", usersController.login);

//? Profile
userRouter.get(
    "/api/v1/users/profile",
    isAuthenticated,
    usersController.profile
);

//? Change Password
userRouter.put(
    "/api/v1/users/change-password",
    isAuthenticated,
    usersController.changeUserPassword
);

//? Update Profile
userRouter.put(
    "/api/v1/users/update-profile",
    isAuthenticated,
    usersController.updateUserProfile
);

export default userRouter;
