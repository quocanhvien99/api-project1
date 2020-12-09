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
		userId: req.user.id,
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
	let { page, field, keyword, limit } = req.query;
	page = parseInt(page);
	limit = parseInt(limit);
    const skip = limit * page; //page start with 0
    
    const { isAdmin } = await User.findById(req.user.id);

	let reports = {};
	let countDocs;
	
	try {        
        if (isAdmin) {
			if ( field && keyword ) {
				if (field == 'name') {
					reports.data = await Report.find({ name: { $regex: keyword }  }, null, { skip, limit });
					countDocs = await Report.countDocuments({ name: { $regex: keyword } });
				} else if (field == 'birthday') {
					let birthday = new Date(keyword);
					reports.data = await Report.find({ birthday: {$gte: keyword, $lt: new Date(birthday.getTime() + 86400000)} }, null, { skip, limit });
				} else {
					reports.data = await Report.find({ [field]: keyword }, null, { skip, limit });
					countDocs = await Report.countDocuments({ [field]: keyword });
				}				
			} else {
				reports.data = await Report.find(null, null, { skip, limit });
				countDocs = await Report.countDocuments();
			}
        } else {
			if ( field && keyword ) {
				if (field == 'name') {
					reports.data = await Report.find({ userId: req.user.id, name: { $regex: keyword }  }, null, { skip, limit });
					countDocs = await Report.countDocuments({ userId: req.user.id, name: { $regex: keyword } });
				} else if (field == 'birthday') {
					let birthday = new Date(keyword);
					reports.data = await Report.find({ userId: req.user.id, birthday: {$gte: keyword, $lt: new Date(birthday.getTime() + 86400000)} }, null, { skip, limit });
				} else {
					reports.data = await Report.find({ userId: req.user.id, [field]: keyword }, null, { skip, limit });
					countDocs = await Report.countDocuments({ userId: req.user.id, [field]: keyword });
				}				
			} else {
				reports.data = await Report.find({ userId: req.user.id }, null, { skip, limit });			
				countDocs = await Report.countDocuments({ userId: req.user.id });	
			}		
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
});

router.get('/statistic',authentication, async (req, res) => {
	const { isAdmin } = await User.findById(req.user.id);

	Report.aggregate(
		[
			{
				$match: isAdmin?{}:{ userId: req.user.id }
			},
			{
				$project: {
					year: { $year: "$date" },
					month: { $month: "$date" }
				}
			},
			{
				$group: {
					_id: {
						month: "$month",
                		year: "$year"
					},
					total: { $sum: 1 }
				}
			},
			{
				$project: {
					_id: 0,
					month: "$_id.month",
					year: "$_id.year",
					total: "$total"
				}
			}
	  	],  
	  	function(err, result) {
			if (err) {
			res.send(err);
			} else {
				let data = {};
				result.map((item) => {
					data[item.year] = {};
				});
				result.map((item) => {
					data[item.year][item.month] = item.total;
				});
				for (let key in data) {
					let tempArr = [];
					for (let i = 1; i <= 12; i++) {
						if (data[key][i]) {
							tempArr.push(data[key][i]);
						} else {
							tempArr.push(0);
						}
					}
					data[key] = tempArr;
				}
				res.json(data);
			}
	  	})
});
module.exports = router;