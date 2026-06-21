import express from "express";
import { askAI } from "../controllers/aiControllers.js";

const aiRouter = express.Router();

aiRouter.post("/ask", askAI);

export default aiRouter;