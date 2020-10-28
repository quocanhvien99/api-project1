const router = require('express').Router();
const authentication = require('../authentication');
const Report = require('../models/Report');
const User = require('../models/User');

router.post('/', authentication, async (req, res) => {
    //Create a new report
	const report = new Report({
		name: req.body.name,
		sex: req.body.sex,
		birthday: req.body.birthday,
		userId: req.user._id,
        content: 'something'
	});
	try {
		const savedReport = await report.save();
		res.send(savedReport);
	} catch (err) {
		res.status(400).send(err);
	}
});

router.get('/', authentication, async (req, res) => {
	//Get all and search report list 
	let { page, by, keyword } = req.query;
	page = parseInt(page);
	const limit = 10;
    const skip = limit * page; //page start with 0
    
    const { isAdmin } = await User.findById(req.user._id);

	let reports = {};
	let countDocs;
	
	try {        
        if (isAdmin) {
			if ( by && keyword ) {
				if (by == 'name') {
					reports.data = await Report.find({ [by]: { $regex: keyword }  }, null, { skip, limit });
					countDocs = await Report.countDocuments({ [by]: { $regex: keyword } });
				} else {
					reports.data = await Report.find({ [by]: keyword }, null, { skip, limit });
					countDocs = await Report.countDocuments({ [by]: keyword });
				}				
			} else {
				reports.data = await Report.find(null, null, { skip, limit });
				countDocs = await Report.countDocuments();
			}
        } else {
			if ( by && keyword ) {
				if (by == 'name') {
					reports.data = await Report.find({ userId: req.user._id, [by]: { $regex: keyword }  }, null, { skip, limit });
					countDocs = await Report.countDocuments({ userId: req.user._id, [by]: { $regex: keyword } });
				} else {
					reports.data = await Report.find({ userId: req.user._id, [by]: keyword }, null, { skip, limit });
					countDocs = await Report.countDocuments({ userId: req.user._id, [by]: keyword });
				}				
			} else {
				reports.data = await Report.find({ userId: req.user._id }, null, { skip, limit });			
				countDocs = await Report.countDocuments({ userId: req.user._id });	
			}		
		}		
		reports.countPages = Math.ceil(countDocs/limit);
		res.status(200).send(reports);
	} catch (err) {
		res.status(404).send(err);
	}
});

router.get('/search', authentication, async (req, res) => {
	//Tìm kiếm
    let { page, prop, value } = req.query;
	page = parseInt(page);
	const limit = 10;
    const skip = limit * page; //page start with 0
    
    const { isAdmin } = await User.findById(req.user._id);

	let reports = {};
	let countDocs;

	try {        
        if (isAdmin) {
			reports.data = await Report.find({ [prop]: value }, null, { skip, limit });
			countDocs = await Report.countDocuments();
        } else {
			reports.data = await Report.find({userId: req.user._id, [prop]: value }, null, { skip, limit });
			countDocs = await Report.countDocuments({userId: req.user._id, [prop]: value });
        }		
		reports.countPages = Math.ceil(countDocs/limit);
		res.status(200).send(reports);
	} catch (err) {
		res.status(404).send(err);
	}
});

router.delete('/', (req, res) => {
	const { _id } = req.body;
    Report.findOneAndDelete({ _id })
		.then(item => res.status(200).json(item))
		.catch(err => res.status(404).json(err));
})
module.exports = router;