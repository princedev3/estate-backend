import express from "express";
import {
  addMessage,
  createChat,
  getAllChats,
  singleChat,
} from "../controller/chatController.js";
import { authMiddleWare } from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/create-chat", authMiddleWare, createChat);
router.get("/get-chats", authMiddleWare, getAllChats);
router.get("/single-chat/:id", authMiddleWare, singleChat);
router.post("/add-message", authMiddleWare, addMessage);

export default router;
