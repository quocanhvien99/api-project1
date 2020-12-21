const router = require('express').Router();
var pdf = require('html-pdf');
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

router.get('/:id', (req, res) => {
	const options = {
		format: 'A4'
	};	

	pdf.create(`
    <html>
    <head>
        <style>
            body {
                margin: 0;
                font-family: sans-serif;
            }
            body > div {
                box-sizing: border-box;              
                page-break-after: always;
                padding: 0 0.5in;
            }
            #mucluc > p {
                margin: 10px 0;
                font-size: larger;
                font-weight: bold;
                line-height: 1;
            }
            p {
                text-indent: 0.2in;
                margin: 5px;
                line-height: 1.5;
            }
            h2 {
                text-transform: uppercase; 
                color: #FF7B00;
            }
        </style>
    </head>
    <body>        
            <head></head>
            <body>
                <div id="bia" style="position: relative; padding: 0;">
                    <img style="width:8.27in;height:11.69in;" src="file:///F:/Web%20Dev/pdf/OutDocument/ri_1.png">
                    <div style="position: absolute; bottom: 1.3in; width: 100%;text-align: center;"><span style="font-size:24pt;color:#fff">ĐỖ QUỐC HUY 30/06/1983</span></div>
                </div>
                <div id="mucluc">
                    <h1 style="text-transform: uppercase; text-align: center;">Mục lục báo cáo</h1>
                    <p>• Thông tin khách hàng</p>
                    <p>• Quy trình báo cáo Thần số học</p>
                    <p>I. CÁC CON SỐ CHỦ ĐẠO TRONG CUỘC ĐỜI</p>
                    <p>• Con số Đường đời</p>
                    <p>• Con số Ngày sinh</p>
                    <p>• Con số Sứ mệnh</p>
                    <p>• Con số Khát tâm</p>
                    <p>• Con số Nhân cách</p>
                    <p>II. CÂN BẰNG CÁC CON SỐ VÀ CUỘC SỐNG</p>
                    <p>• Con số Thể chất, tinh thần, cảm xúc, trực giác</p>
                    <p>• Con số Trường thành</p>
                    <p>• Con số Cầu nối L/E, H/P</p>
                    <p>• Con số Bài học cuộc sống</p>
                    <p>• Con số Đam mê tiềm ẩn</p>
                    <p>• Con số Cân bằng</p>
                    <p>• Con số Suy nghĩ hợp lý</p>
                    <p>• Con số Tiềm thức ẩn</p>
                    <p>III. CHU KỲ CUỘC SỐNG – ĐỈNH CAO & THÁCH THỨC</p>
                    <p>• 4 Chu kỳ cuộc sống</p>
                    <p>• 4 Đỉnh cao cuộc sống</p>
                    <p>• 4 Thách thức cuộc sống</p>
                    <p>IV. NĂM CÁ NHÂN VÀ TÍNH CHẤT</p>
                    <p>• Số năm cá nhân & tính chất 2020</p>
                    <p>• Số năm cá nhân & tính chất 2021</p>
                    <p>• Số năm cá nhân & tính chất 2022</p>
                </div>
                <div>
                    <h2>Thông tin khách hàng</h2>
                    <div style="font-size: larger; border: 2px dashed #0070C0; border-radius: 30px; width: fit-content; padding: 10px 150px 10px 20px; background-color: #E7E6E6; margin-top: 30px;">
                        <p>Họ và tên: <span style="text-transform: uppercase; font-weight: bold;">đỗ quốc huy</span></p>
                        <p>Sinh nhật: <span style="font-weight: bold;">30/06/1983</span></p>
                        <p>Họ và tên: <span style="text-transform: capitalize; font-weight: bold;">Nam</span></p>
                    </div>
                    <div>
                        <h2 style="text-align: center;">Giới thiệu</h2>
                        <p>Các quy luật của vũ trụ ảnh hưởng đến mọi thứ xung quanh chúng ta. Tất cả mọi thứ đã được tạo ra
                            đều có liên quan đến các con số. Ví dụ, hạt hướng dương có thể tạo ra mô hình xoắn ốc logarit và tất cả
                            các loài hoa tạo nên góc vàng (góc có tỉ lệ vàng trong toán học). Nhìn vào thế giới xung quanh, quan sát
                            các dạng lá trên cây, xem cách các nhánh mọc và lưu ý khoảng cách giữa chúng. Bạn có biết nó phụ
                            thuộc vào số Fibonacci không? Có nhiều sự thật khác cho chúng ta thấy những điều đáng kinh ngạc.
                            Thần số học mở ra ý nghĩa ẩn đằng sau các con số trong cuộc sống của chúng ta.
                        </p>
                        <p>Thần số học là một môn khoa học siêu hình, dựa trên mối quan hệ giữa các con số và các sự kiện
                            trùng khớp. Nó được giới thiệu từ hơn hai ngàn năm trước bởi các nhà triết học nổi tiếng (Pythagoras,
                            Plato, Aristotle…). Số học luôn được đối xử với sự tôn trọng lớn. Mỗi số có một tính chất cụ thể tạo ra
                            các rung động nhất định, xử lý các trường hợp cụ thể trong cuộc sống. Việc chia các con số thành "may
                            mắn" và "không may mắn" là sai, nhưng một số con số có thể không phù hợp, nó mang lại sự không
                            phù hợp, sai hướng có thể khiến người sở hữu con số gặp khó khăn.
                        </p>
                        <p>Mặc dù Thần số học không phải là khoa học chính xác, nó là một công cụ vô giá sẽ giúp bộc lộ tài
                            năng và khả năng tiềm ẩn của bạn. Khi chúng ta biết về khả năng của mình và có thể sử dụng lợi thế đó
                            để mang lại lợi ích, chúng ta có thể đạt được nhiều hơn trong cuộc sống này. Số học cũng giúp chúng ta
                            đưa ra quyết định đúng đắn. Chúng ta trở nên mạnh mẽ hơn khi biết mình có sức mạnh và ý thức trong
                            việc sử dụng chúng.</p>
                            <p>Mặc dù Thần số học không phải là khoa học chính xác, nó là một công cụ vô giá sẽ giúp bộc lộ tài
                                năng và khả năng tiềm ẩn của bạn. Khi chúng ta biết về khả năng của mình và có thể sử dụng lợi thế đó
                                để mang lại lợi ích, chúng ta có thể đạt được nhiều hơn trong cuộc sống này. Số học cũng giúp chúng ta
                                đưa ra quyết định đúng đắn. Chúng ta trở nên mạnh mẽ hơn khi biết mình có sức mạnh và ý thức trong
                                việc sử dụng chúng.</p>
                    </div>                    
                </div>
                <div>
                    <h2 style="text-align: center;">TỔNG QUAN CÁC CON SỐ CỦA BẠN</h2>
                </div>
                <div>
                    <h2>Phần I: ĐẶC ĐIỂM CỦA BẠN</h2>
                    <p>
                        Tất cả các số bắt nguồn từ tên của bạn phản ánh BẠN. Chúng là một bản thiết kế tài năng, thiếu sót,
đặc điểm tính cách và các phẩm chất khác của bạn. Các chương sau tập trung vào những thách thức và
cơ hội bạn sẽ gặp trên con đường của mình và các thuộc tính bạn có thể có được khi thời gian trôi qua.
                    </p>
                    <p>
                        Phần 1 này giống như một cái nhìn từ xa, các phần tiếp theo giải thích ý nghĩa của từng con số một
cách chi tiết hơn. Chúng ta sẽ dần dần xây dựng một bức tranh đầy đủ hơn về cá nhân phức tạp và độc
đáo của bạn.
                    </p>
                    
                </div>
            </body>
        </html>
    </body>
</html>

    `, options).toStream(function(err, stream){
        stream.pipe(res);
      });
});
module.exports = router;