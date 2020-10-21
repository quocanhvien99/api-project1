const router = require('express').Router();
const Report = require('../models/Report');

router.post('/create', async (req, res) => {
    //Create a new report
	const report = new Report({
		name: req.body.name,
		sex: req.body.sex,
        birthday: req.body.birthday,
        content: 'something'
	});
	try {
		const savedReport = await report.save();
		res.send(savedReport);
	} catch (err) {
		res.status(400).send(err);
	}
});
router.get('/list', (req, res) => {
    Report.find()
        .then((list) => res.json(list));
})
router.delete('/delete', (req, res) => {
    Report.findOneAndDelete({ _id: req.body.id })
        .then((item) => res.json(item));
})
module.exports = router;