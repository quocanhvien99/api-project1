const router = require('express').Router();
const User = require('../models/User');
const authentication = require('../authentication');

const authCheck = (req, res, next) => {
    if(!req.user) {
        res.redirect('/login');
        return;
    }
    next();
}

router.get('/', authCheck, async (req, res) => {
    const user = await User.findOne({ _id: req.user.id });
    res.status(200).send(user);
})

module.exports = router;