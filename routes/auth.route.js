const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const User = require("../Models/User.model");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const { verify } = require("jsonwebtoken");

router.get("/", verifyAccessToken, async (req, res, next) => {
  res.status(200).json({
    status: true,
  });
});

router.post("/register", async (req, res, next) => {
  try {
    //const{email,password} = req.body
    //if(!email || !password) throw createError.BadRequest()
    const result = await authSchema.validateAsync(req.body);

    //check if user present in database
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(
        `${result.createErroremail} is already registered`
      );

    const user = new User({
      email: result.email,
      password: result.password,
    });
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi == true) error.status = 422;
    //calls the error handler in th app.js file
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });

    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch) throw createError.Unauthorized("Username/Password not Valid");

    const userId = user.id;
    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(user.id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi == true)
      return next(createError.BadRequest("Invalid Username/Password"));
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refToken } = req.body;
    if (!refToken) throw createError.BadRequest();

    const userId = await verifyRefreshToken(refToken);
    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(userId);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
