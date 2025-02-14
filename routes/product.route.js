import express from "express";
import {
  createProduct,
  getAllProduct,
  getSingleProduct,
  savedAPost,
  getFavoriteProduct,
} from "../controller/productController.js";
import { upload } from "../middleware/multimultermiddleware.js";
import { authMiddleWare } from "../middleware/auth-middleware.js";

const router = express.Router();
router.post(
  "/create",
  upload.array("images", 5),
  authMiddleWare,
  createProduct
);
router.post("/savedpost", authMiddleWare, savedAPost);
router.get("/getHomes", getAllProduct);
router.get(
  "/favorite",
  authMiddleWare,

  getFavoriteProduct
);
router.get("/:id", getSingleProduct);
export default router;
