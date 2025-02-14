import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary-config.js";
import prisma from "../config/prisma-config.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  return user;
};
export const generateToken = async (userId, email) => {
  const accessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  const refreshToken = uuidv4();

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { password, username, email } = await req.body;
    const files = await req.file;

    const uploader = await cloudinary.uploader.upload(files.path, {
      folder: "ecommerce",
    });

    const hash = bcrypt.hashSync(password, 10);

    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hash,
        avatar: uploader.secure_url,
      },
    });

    res.json({ message: "Form data received successfully" });
  } catch (error) {
    console.log(error);
    res.json({ message: "something went wrong" });
  }
};

const setToken = async (response, accessToken, refreshToken) => {
  response.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
  response.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = await req.body;
    const user = await getUserByEmail(email);
    if (!user) {
      res.json({ message: "something went wrong" });
      return;
    }
    const unHashPassword = bcrypt.compareSync(password, user.password);

    if (!unHashPassword) {
      res.json({ message: "something went wrong" });
      return;
    }
    const { accessToken, refreshToken } = await generateToken(user?.id, email);
    const ress = await setToken(res, accessToken, refreshToken);

    const { password: userPassword, ...userProperties } = user;
    res
      .status(200)
      .json({ message: "login in successfull", user: userProperties });
  } catch (error) {
    console.log(error);
    res.json({ message: "something went wrong" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "logout successful" });
  } catch (error) {
    res.json({ message: "something went wrong" });
    return;
  }
};

export const updateUser = async (req, res) => {
  try {
    const userdetails = await req.userDetails;
    const { password, username, email } = await req.body;
    const file = await req.file;
    if (userdetails.email !== email) {
      return res
        .status(500)
        .json({ message: "you can only update your account" });
    }
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return res.status(500).json({ message: "invalid request" });
    }
    let newPassword;
    if (password) {
      newPassword = bcrypt.hashSync(password, 10);
    }
    let uploader;
    if (file) {
      uploader = await cloudinary.uploader.upload(file?.path, {
        folder: "ecommerce",
      });
    }
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        ...(username && { username }),
        ...(password && { password: newPassword }),
        ...(file && { avatar: uploader?.secure_url }),
      },
    });
    const { password: userPassword, ...userProperties } = updatedUser;
    res.status(200).json(userProperties);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
    return;
  }
};
