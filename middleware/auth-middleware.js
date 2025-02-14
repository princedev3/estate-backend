import jwt from "jsonwebtoken";

export const authMiddleWare = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      jwt.verify(
        accessToken,
        process.env.JWT_SECRET,
        async (error, paylaod) => {
          if (error) {
            return res
              .status(500)
              .json({ message: "can not authenticate user" });
          }
          req.userDetails = paylaod;
          next();
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not authenticate user" });
  }
};
