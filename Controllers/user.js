import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import User from "../db/userModel.js";
import appError from "../Errors/appError.js";

dotenv.config();

const createJwt = (id, email, name, description) => {
  return jwt.sign({ id, email, name, description }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async login(request, response, next) {
    try {
      const user = await User.findOne({ email: request.body.email });
      if (!user) {
        return next(appError.notFound("User not found"));
      }
      let compare = bcrypt.compareSync(request.body.password, user.password);
      if (!compare) {
        return next(appError.badRequest("Wrong email or password"));
      }
      const token = createJwt(user.id, user.email, user.name, user.description);
      return response.status(200).json({
        email: user.email,
        token,
        name: user.name,
        description: user.description,
      });
    } catch (e) {
      next(appError.internalServerError(e.message));
    }
  }
  async signup({ body: { name, email, password, description } }, res, next) {
    try {
      if (!email || !password) {
        return next(appError.badRequest("Empty email or password"));
      }
      const hash = await bcrypt.hash(password, 5);
      const user = new User({
        name,
        email,
        password: hash,
        description,
      });
      await user.save();
      return res.status(200).json({ message: "Signed Up successfully" });
    } catch (e) {
      next(appError.internalServerError(e.message));
    }
  }

  async getByEmail(request, response, next) {
    try {
      if (!request.params.email) {
        return next(appError.badRequest("Email was not set"));
      }
      const user = await User.findOne({ email: request.params.email });
      if (!user) {
        return next(appError.notFound("Selected user does not exist"));
      }
      if (user.email !== request.user.email) {
        return next(
          appError.forbidden("You does not have access for this account")
        );
      }
      response.status(200).json(user);
    } catch (e) {
      next(appError.internalServerError(e.message));
    }
  }

  async update(request, response, next) {
    try {
      const { email } = request.params;
      const filter = { email: email };

      const updatedUser = await User.findOneAndUpdate(filter, request.body, {
        new: true,
      });
      if (!updatedUser) {
        return next(appError.notFound("User not found"));
      }
      return response.status(200).json(updatedUser);
    } catch (e) {
      next(appError.internalServerError(e.message));
    }
  }
  async check(req, res) {
    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      description: req.user.description,
    });
  }
}

export default new UserController();
