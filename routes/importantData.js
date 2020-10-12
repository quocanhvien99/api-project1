const router = require('express').Router();
const User = require('../models/User');
const authentication = require('../authentication');

router.get('/', authentication, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    res.status(200).send(`Xin chào ${user.name}`);
})

module.exports = router;