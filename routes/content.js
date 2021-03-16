const router = require('express').Router();
const Content = require('../models/Content');
const authentication = require('../authentication');
const adminAuth = require('../adminAuth');
const { contentValidation, updateContentValidation } = require('../validation');

router.post('/', authentication, adminAuth, async (req, res) => {
	//Validate data
	const { error } = contentValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//Create a new content
	const content = new Content({
		content: req.body.content,
		number: req.body.number,
		key: req.body.key,
	});
	try {
		const savedContent = await content.save();
		res.send(savedContent);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.put('/', authentication, adminAuth, async (req, res) => {
	//Validate data
	const { error } = updateContentValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	//Find and change
	try {
		const content = await Content.findOneAndUpdate(
			{ _id: req.body.id },
			{
				number: req.body.number,
				content: req.body.content,
			}
		);
		res.status(200).send(content);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.delete('/', authentication, adminAuth, (req, res) => {
	const { _id } = req.body;
	Content.findOneAndDelete({ _id })
		.then((content) => res.status(200).json(content))
		.catch((err) => res.status(404).json(err));
});

router.get('/', authentication, adminAuth, async (req, res) => {
	let { page, limit, key } = req.query;
	page = parseInt(page);
	limit = parseInt(limit);
	const skip = limit * page; //page start with 0

	let content = {};
	let countDocs;

	try {
		content.data = await Content.find({ key }, null, {
			skip,
			limit,
		});
		countDocs = await Content.countDocuments({ key });
		content.countPages = Math.ceil(countDocs / limit);
		res.status(200).send(content);
	} catch (err) {
		res.status(404).send(err);
	}
});

module.exports = router;
