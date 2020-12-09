const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	if (!req.user) return res.status(401).send('Access denied');
	next();
};
