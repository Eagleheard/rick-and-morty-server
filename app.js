const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const auth = require("./auth");

dbConnect();

const whitelist = process.env.WHITELIST;
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Credentials",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

app.post("/register", (request, response) => {
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        name: request.body.name,
        email: request.body.email,
        password: hashedPassword,
        description: request.body.description,
      });

      user
        .save()
        .then((result) => {
          response.status(201).send({
            message: "User created successfully",
            result,
          });
        })
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

app.post("/login", (request, response) => {
  User.findOne({ email: request.body.email })
    .then((user) => {
      bcrypt
        .compare(request.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            return response
              .status(400)
              .send({ message: "Wrong email or password", error });
          }
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        .catch((error) => {
          response
            .status(400)
            .send({ message: "Wrong email or password", error });
        });
    })
    .catch((e) => {
      response.status(404).send({ message: "Not found", e });
    });
});

app.get("/profile/:email", async (request, response) => {
  const { email } = request.params;
  const user = await User.findOne({ email: email }).catch((error) => {
    return response.status(500).send(error);
  });
  if (user.email !== email) {
    return response
      .status(403)
      .send("You does not have access for this account");
  } else {
    response.status(200).json({
      email: user.email,
      name: user.name,
      description: user.description,
    });
  }
});

app.put("/update/:email", async (request, response) => {
  const { email } = request.params;
  const filter = { email: email };

  const updatedUser = await User.findOneAndUpdate(filter, request.body, {
    new: true,
  }).catch((error) => {
    return response.status(500).send(error);
  });

  return response.status(200).json(updatedUser);
});

app.get("/auth", auth, (request, response) => {
  response.send({
    email: request.user.userEmail,
  });
});

module.exports = app;
