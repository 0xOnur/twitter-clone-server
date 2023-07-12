import express from "express";
import { getPoll, votePoll } from "../controllers/pollController";
import authMiddleware from "../middlewares/authMiddleware";

// http://localhost:5000/poll/
const pollRoutes = express.Router();

pollRoutes.get("/get-poll/:pollId", getPoll);

pollRoutes.put("/vote-poll/:pollId", authMiddleware, votePoll);

export default pollRoutes;