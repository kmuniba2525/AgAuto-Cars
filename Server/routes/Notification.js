import express from "express";
import {
  getNotifications,
  clearNotification,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", getNotifications);

notificationRouter.delete("/:id", clearNotification);

export default notificationRouter;