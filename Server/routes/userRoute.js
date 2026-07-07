import express from 'express';
import { isAuth, login, logout, register, googleAuth } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter=express.Router();

userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.post('/google',googleAuth)
userRouter.get('/is-auth',authUser,isAuth)
userRouter.get('/logout',authUser,logout)

export default userRouter;