const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authentication = require('../authentication');
const adminAuth = require('../adminAuth');

const {
	registerValidation,
	passwordValidation
} = require('../validation');

router.post('/register', async (req, res) => {
	//Validate data
	const { error } = registerValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//Checking if the user already exists
	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist) return res.status(400).send('Email already exists');

	//Encode password
	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	//Create a new user
	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: hashedPassword
	});
	try {
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.put('/change', authentication, async (req, res) => {
	//Validate data
	const { error } = passwordValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//Encode password
	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	//Find user and change password
	try {
		const user = await User.findOneAndUpdate(
			{ _id: req.user.id },
			{ password: hashedPassword }
		);
		res.status(200).send(user);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/delete', authentication, adminAuth, (req, res) => {
	const { _id } = req.body;
	User.findOneAndDelete({ _id })
		.then(user => res.statusCode(200).json(user))
		.catch(err => res.statusCode(404).json(err));
});

router.get('/info', authentication, async (req, res) => {
	const { name, email, date, isAdmin } = await User.findById(req.user.id);
	res.status(200).send({ name, email, date, isAdmin });
});

router.get('/list', authentication, adminAuth, async (req, res) => {
    let { page, limit } = req.query;
	page = parseInt(page);
	limit = parseInt(limit);
	const skip = limit * page; //page start with 0

	let users = {}
	let countDocs;

	try {
		users.data = await User.find(null, null, { skip, limit });
		countDocs = await User.countDocuments();
		users.countPages = Math.ceil(countDocs/limit);
		res.status(200).send(users);
	} catch (err) {
		res.status(404).send(err);
	}
});

module.exports = router;