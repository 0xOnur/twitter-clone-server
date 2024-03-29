import express from "express"
import { getNotifications, markNotificationAsRead } from "../controllers/notificationController"
import authMiddleware from "../middlewares/authMiddleware"

// http://localhost:5000/notification/
const notificationRoutes = express.Router();

notificationRoutes.get("/get-notifications", authMiddleware, getNotifications);

notificationRoutes.put("/mark-notification-as-read/:notificationId", authMiddleware, markNotificationAsRead);

export default notificationRoutes;