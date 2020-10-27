const User = require("./models/User");

module.exports = async (req, res, next) => {
    const { isAdmin } = await User.findById(req.user._id);
    if (!isAdmin) return res.status(401).send('Access denied');
    next();
}