const router = require('express').Router();
var pdf = require('html-pdf');
const authentication = require('../authentication');
const Report = require('../models/Report');
const User = require('../models/User');
const Content = require('../models/Content');

router.post('/', authentication, async (req, res) => {
    let temp = await Promise.all([
        Content.find({key: 'SỐ SỨ MỆNH', number: '12/3'}),
        Content.find({key: 'KHÁT TÂM', number: '18/9'}),
        Content.find({key: 'NHÂN CÁCH', number: '21/3'}),
        Content.find({key: 'CẦU NỐI KHÁT TÂM/NHÂN CÁCH', number: '6'}),
        Content.find({key: 'CON SỐ ĐƯỜNG ĐỜI', number: '12/3'}),
        Content.find({key: 'SỐ NGÀY SINH', number: '30'}),
        Content.find({key: 'THÁCH THỨC 1', number: '3'}),
        Content.find({key: 'THÁCH THỨC 2', number: '0'}),
        Content.find({key: 'THÁCH THỨC 3', number: '3'}),
        Content.find({key: 'THÁCH THỨC 4', number: '3'}),
        Content.find({key: 'CẦU NỐI ĐƯỜNG ĐỜI/SỨ MỆNH', number: '0'}),
        Content.find({key: 'TRƯỞNG THÀNH', number: '6'}),
        Content.find({key: 'SỐ SUY NGHĨ HỢP LÝ', number: '3'}),
        Content.find({key: 'CHU KỲ 1', number: '6'}),
        Content.find({key: 'CHU KỲ 2', number: '3'}),
        Content.find({key: 'CHU KỲ 3', number: '3'}),
        Content.find({key: 'ĐỈNH CAO 1', number: '9'}),
        Content.find({key: 'ĐỈNH CAO 2', number: '6'}),
        Content.find({key: 'ĐỈNH CAO 3', number: '6'}),
        Content.find({key: 'ĐỈNH CAO 4', number: '9'}),
        Content.find({key: 'SỐ CÂN BẰNG', number: '2'}),
        Content.find({key: 'ĐAM MÊ TIỀM ẨN', number: '3'}),
        Content.find({key: 'NỀN TẢNG', number: 'h'}),
        Content.find({key: 'TIỀM THỨC ẨN', number: '5'}),
        Content.find({key: 'CẤP ĐỘ VẬT LÝ', number: '4'}),
        Content.find({key: 'CẤP ĐỘ TINH THẦN', number: '8'}),
        Content.find({key: 'CẤP ĐỘ CẢM XÚC', number: '12/3'}),
        Content.find({key: 'CẤP ĐỘ TRỰC GIÁC', number: '24/6'}),
        Content.find({key: 'NĂM CÁ NHÂN 2020', number: '4'}),
        Content.find({key: 'NĂM CÁ NHÂN 2021', number: '5'}),
        Content.find({key: 'NĂM CÁ NHÂN 2022', number: '6'}),
        Content.find({key: 'CHU KỲ TINH HOA 2020', number: '17/8'}),
        Content.find({key: 'CHU KỲ TINH HOA 2021', number: '17/8'}),
        Content.find({key: 'CHU KỲ TINH HOA 2022', number: '17/8'})
    ]);
    let content = [];
    temp.map((item) => {
        content.push({ content: item[0].content, number: item[0].number, key: item[0].key });
    })
    
    
    //Create a new report
	const report = new Report({
		name: req.body.name,
		sex: req.body.sex,
		birthday: req.body.birthday,
		userId: req.user.id,
        content: content
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

router.get('/:id', async (req, res) => {
    const reportId = req.params.id;
    const data = await Report.findById(reportId);
    const content = data.content;
    console.log(content);

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
            .number {
                font-size: xx-large;
                text-align: center;
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
                <div>
                    <h2 style="text-align: center;">SỐ SỨ MỆNH</h2>
                    <p>
                    Số Sứ mệnh của bạn cho thấy sự cấu thành từ thể chất và tinh thần của bạn, định hướng hay mục
                    tiêu cuộc sống của bạn. Nó đại diện cho một mục tiêu trọn đời mà bạn đang nhắm tới. Bạn làm việc để
                    hoàn thành tiềm năng này mỗi ngày trong cuộc sống của bạn. Do đó, số Sứ mệnh cho thấy mục tiêu
                    bên trong của bạn, con người mà bạn muốn trở thành.                    
                    </p>
                    <p>
                    Số Sứ mệnh cho thấy tài năng, khả năng và những thiếu sót đã ở bên bạn khi bạn bước vào cơ thể
                    con người. Tên của bạn và những con số bắt nguồn từ nó, cho thấy sự phát triển cũng như những tài
                    năng và vấn đề trong suốt cuộc đời của bạn.
                    </p>
                    <p>
                    Đối với những người chấp nhận thuyết “Luân hồi”, sự rung động của tên đầy đủ của bạn có thể được
                    xem là toàn bộ sự tiến hóa cá nhân của bạn, kinh nghiệm, tài năng và trí tuệ tích lũy qua nhiều kiếp
                    sống. Mỗi trải nghiệm, dù lớn hay nhỏ, dọc theo con đường tiến hóa này đã ảnh hưởng đến sự phát triển
                    của bạn và đưa bạn đến trạng thái hiện tạ
                    </p>
                    <p>
                    Sứ mệnh là bản thể của bạn. Đường đời là bài học lớn mà bạn đang cố gắng học trong cuộc sống
                    này. Nhân cách của bạn sẽ xuất hiện dần dần qua thời gian.
                    </p>
                    <p>
                    Số Sứ mệnh của bạn giúp bạn hiểu được bản chất cơ bản và các khả năng và cũng như vấn đề vốn
                    có trong bản thể của bạn.
                    </p>
                    <div class="number">${content[0].number}</div>
                    ${content[0].content}
                </div>
                <div>
                    <h2 style="text-align: center;">KHÁT TÂM</h2>
                    <p>
                    Khát tâm là nội tâm của bạn. Nó cho thấy sự thôi thúc tiềm ẩn, động lực thực sự của bạn. Nó tiết lộ ý
                    định chung đằng sau nhiều hành động của bạn.
                    </p>
                    <p>
                    Do đó, nó ảnh hưởng đáng kể đến các lựa chọn bạn thực hiện trong cuộc sống. Số Khát tâm được
xem là một phần của bức tranh lớn, được gọi là những con số cốt lõi, bao gồm Đường đời, Sứ mệnh,
Ngày bạn được sinh ra và Nhân cách. Nhưng mỗi con số là một khía cạnh khác của bạn.
                    </p>
                    <p>
                    Số Sứ mệnh cho thấy tài năng và khả năng của bạn, và định hướng chung của bạn trong cuộc sống.
Số Đường đời là bài học trung tâm bạn đến thế giới này để học hỏi. Ngày bạn được sinh ra có mối liên
hệ rất chặt chẽ với Đường đời của bạn. Nó tiết lộ những tài năng cụ thể mà bạn sở hữu, sẽ hữu ích cho
bạn trong việc thực hiện Đường đời của bạn. Số Nhân cách tiết lộ cách mọi người có xu hướng nhìn thấy
bạn. Nó cũng cho thấy những đặc điểm bạn đang thể hiện ra với thế giới. Số Khát tâm thể hiện bản sắc
tâm hồn của bạn.
                    </p>
                    <div class="number">${content[1].number}</div>
                    ${content[1].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NHÂN CÁCH</h2>
                    <p>
                    Nhân cách là cách bạn thể hiện ra bên ngoài cho thế giới, đó là bản chất thật của bạn. Đó là những
khía cạnh mà bạn cảm thấy thoải mái khi chia sẻ với mọi người ngay từ đầu của một mối quan hệ. Qua
thời gian và sự tin tưởng, người khác mới có thể hiểu sâu hơn về bản chất của bạn; con người thực sự,
thực tế, khát hao, Sứ mệnh của bạn, v.v.
                    </p>
                    <p>
                    Số Nhân cách của bạn thường đóng vai trò là một thiết bị kiểm duyệt về những gì bạn gửi đi và
những gì bạn cho phép tiếp cận. Nó phân biệt đối xử trong các loại người và loại thông tin đưa trái tim và
tâm trí của bạn. Vì lý do này, nhân cách của bạn thường hẹp hơn và bảo vệ theo định nghĩa của nó so
với con người thực của bạn. Nó có thể sàng lọc một số điều bạn không muốn giải quyết, nhưng nó cũng
hoan nghênh những điều đó ngay lập tức liên quan đến bản chất bên trong của bạn.
                    </p>
                    <p>
                    Số Nhân cách của bạn cũng cho biết người khác nhìn nhận bạn như thế nào. Không ai có thể khách
quan về bản thân mình. Ngay cả những người bạn thân nhất và người thân của chúng ta cũng gặp khó
khăn khi mô tả cách họ nhìn thấy chúng ta.
                    </p>
                    <div class="number">${content[2].number}</div>
                    ${content[2].content}
                </div>
                <div>
                    <h2 style="text-align: center;">CẦU NỐI KHÁT TÂM/NHÂN CÁCH</h2>
                    <p>
                    Chúng ta có định kiến nhất định về bản thân và về những người xung quanh. Chúng ta hiếm khi nghĩ
rằng hình ảnh của chúng ta về mọi người khác với nhận thức của họ về chính họ - cách họ nhìn nhận và
hành xử.
                    </p>
                    <p>
                    Bạn có bao giờ tự hỏi tại sao một sự việc, hành động nhưng bạn và những người khác lại có cách
phản ứng khác nhau không? Câu trả lời là trong cầu nối Khát tâm/Nhân cách. Nó cho thấy sự thật ở
giữa. Đây là một cây cầu kết nối quan điểm của bạn về bản thân và hình ảnh phản chiếu của bạn trong
mắt người khác.
                    </p>
                    <div class="number">${content[3].number}</div>
                    ${content[3].content}
                </div>
                <div>
                    <h2>Phần II: CON ĐƯỜNG CUỘC SỐNG CỦA BẠN</h2>
                    <p>
                    Hơi thở đầu tiên của bạn đánh dấu sự khởi đầu của hành trình của bạn trên con đường chúng tôi gọi
là Con đường cuộc sống của bạn. Do đó, điều có ý nghĩa là con số quan trọng nhất trong biểu đồ số
học của bạn đến từ ngày sinh của bạn. Số Đường đời của bạn đưa ra một phác thảo rộng rãi về các cơ
hội, thách thức và bài học bạn gặp trong suốt cuộc đời. Nó cũng tiết lộ những điểm mạnh, tài năng cụ
thể và những đặc điểm bạn được trao để giúp bạn vượt qua thử thách và phát triển thành tốt nhất có thể.
                    </p>
                </div>
                <div>
                <h2 style="text-align: center;">CON SỐ ĐƯỜNG ĐỜI</h2>
                <p>
                Nếu có một khoảnh khắc biến đổi hoàn toàn, đó là khoảnh khắc bạn được sinh ra.
Ngay lúc đó, bạn bước qua cánh cửa vào một thực tại mới - cuộc sống con người. Con số
quan trọng nhất trong bản đồ Thần số của bạn dựa trên ngày sinh của bạn.
                </p>
                <p>
                Ngay tại thời điểm đó, bạn là một người độc đáo và độc nhất như chính mã ADN hay
dấu vân tay của bạn. Tất cả mọi thứ đã được sắp đặt sẵn cho bạn giống như một cuộc
chơi sắp bắt đầu. Cuộc sống với những tiềm năng đã được chuẩn bị cho bạn, bạn hoàn
toàn tự do để sống cuộc đời mình mong muốn. Phát huy toàn bộ tiềm năng trong bạn hay
tạo ra một số phiên bản nhỏ hơn của chính bạn - tất cả phụ thuộc vào sự nỗ lực và cam
kết của bạn. Tiềm năng luôn tồn tại trong bạn, còn bạn là người đưa ra quyết định để biến
chúng thành hiện thực. Đó là lựa chọn của bạn. Thời điểm bạn sinh ra chính là một con
số tiềm ẩn
                </p>
                <p>
                Con số Đường đời cho bạn một cái nhìn rộng về những cơ hội, thách thức và bài học
mà bạn sẽ gặp trong cuộc đời này. Số Đường đời của bạn là thông tin quan trọng nhất có
sẵn trong bạn.
                </p>
                <div class="number">${content[4].number}</div>
                ${content[4].content}
                </div>
                <div>
                <h2 style="text-align: center;">SỐ NGÀY SINH</h2>
                <p>
                Sự ra đời của một cá nhân là một kỳ quan thực sự xảy ra mỗi ngày. “Mỗi người là duy nhất" - đó là
sự thật và Thần số học biết điều đó. Sẽ không có khoảnh khắc nào khác như thế này. Số sinh nhật đại
diện cho những đặc điểm, lĩnh vực chuyên môn hoặc kỹ năng bạn cần phát triển và bạn sẽ thành công
nếu bạn kết nối cuộc sống của mình với nó. Mỗi ngày trong tháng có những đặc điểm riêng được gán
cho những người sinh ra dưới mỗi ngày đó. Điều đó không có nghĩa là một người không có lựa chọn nào
khác ngoài việc phát triển chúng. Tuy nhiên, hành trình trong cuộc sống sẽ dễ dàng hơn nhiều nếu cá
nhân đó tiến bộ trong một điều gì đó mà người ta có thiên hướng cụ thể. Số sinh nhật của bạn có thể tiết
lộ đặc điểm bẩm sinh tích cực và tiêu cực của bạn
                </p>
                <p>
                Ngay tại thời điểm đó, bạn là một người độc đáo và độc nhất như chính mã ADN hay
dấu vân tay của bạn. Tất cả mọi thứ đã được sắp đặt sẵn cho bạn giống như một cuộc
chơi sắp bắt đầu. Cuộc sống với những tiềm năng đã được chuẩn bị cho bạn, bạn hoàn
toàn tự do để sống cuộc đời mình mong muốn. Phát huy toàn bộ tiềm năng trong bạn hay
tạo ra một số phiên bản nhỏ hơn của chính bạn - tất cả phụ thuộc vào sự nỗ lực và cam
kết của bạn. Tiềm năng luôn tồn tại trong bạn, còn bạn là người đưa ra quyết định để biến
chúng thành hiện thực. Đó là lựa chọn của bạn. Thời điểm bạn sinh ra chính là một con
số tiềm ẩn
                </p>
                <p>
                Bạn cần biết số sinh nhật của mình vì nó có thể thực hiện công việc của một chiếc la bàn trong việc
hướng dẫn bạn trong suốt cuộc đời. Bạn không chỉ nhận biết những đặc điểm tích cực và tiêu cực của
bạn; bạn có thể thấy những gì bạn có thể và làm như thế nào dễ nhất để có được cuộc sống tốt nhất.
                </p>
                <div class="number">${content[5].number}</div>
                ${content[5].content}
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