import appError from "../Errors/appError.js";

const ErrorHandler = (err, req, res, next) => {
  if (err instanceof appError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: "Unexpected error" });
};

export default ErrorHandler;
