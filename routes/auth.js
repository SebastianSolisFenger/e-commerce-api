const router = require('express').Router();
const User = require('../models/user');
const CryptoJS = require('crypto-js');

// REGISTER USER
router.post('/register', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
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
      user.password,
      process.env.PASS_SEC
    );

    const password = hashedPassword.toString(CryptoJS.enc.Utf8);

    // WRONG PASSWORD
    password !== req.body.password &&
      res.status(401).json('Wrong credentials!');

    // IF ALL IS OK
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
