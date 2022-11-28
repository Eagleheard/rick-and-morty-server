import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import AppError from "../Errors/appError.js";

export const authMiddleware = async (request, response, next) => {
  try {
    const token = await request.headers.authorization.split(" ")[1];
    if (!token) {
      next(AppError.unauthorized("Need authorization"));
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    request.user = decoded;
    next();
  } catch (e) {
    next(AppError.unauthorized("Need authorization"));
  }
};
