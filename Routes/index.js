import express from "express";

import user from "./user.js";

const router = new express.Router();

router.use("/user", user);

export default router;
