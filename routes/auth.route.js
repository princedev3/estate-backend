import express from "express";
import {
  login,
  logout,
  register,
  updateUser,
} from "../controller/authController.js";
import { upload } from "../middleware/multermiddleware.js";
import { authMiddleWare } from "../middleware/auth-middleware.js";

const router = express.Router();
router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/update", authMiddleWare, upload.single("avatar"), updateUser);

export default router;
