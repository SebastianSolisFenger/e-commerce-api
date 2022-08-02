// @ts-nocheck
const router = require('express').Router();
const User = require('../models/user');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

// REGISTER USER
router.post('/register', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      // @ts-ignore
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    // IF THREE IS NO USER
    !user && res.status(401).json('Wrong credentials!');

    const hashedPassword = CryptoJS.AES.decrypt(
      // @ts-ignore
      user.password,
      // @ts-ignore
      process.env.PASS_SEC
    );

    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    // WRONG PASSWORD
    Originalpassword !== req.body.password &&
      res.status(401).json('Wrong credentials!');

    // CREATE TOKEN
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    );

    const { password, ...others } = user._doc;

    // IF ALL IS OK
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
