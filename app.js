import express from "express";
import authRoute from "./routes/auth.route.js";
import productRoute from "./routes/product.route.js";
import chatRoute from "./routes/chat.route.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 8080;
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    // method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoute);
app.use("/api/product", productRoute);
app.use("/api/chat", chatRoute);
app.use("/", async (req, res) => {
  try {
    return res.status(200).send("welcome home");
  } catch (error) {
    console.log(error);
    return;
  }
});

app.listen(PORT, () => console.log("server is running"));
