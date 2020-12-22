const router = require('express').Router();
var pdf = require('html-pdf');
const { merge } = require('merge-pdf-buffers');
const authentication = require('../authentication');
const Report = require('../models/Report');
const User = require('../models/User');
const Content = require('../models/Content');
var html_to_pdf = require('html-pdf-node');

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
    const formatDate = (birthday) => {
        birthday = new Date(birthday);
        const d = birthday.getDate();
        const m = birthday.getMonth() + 1;
        const y = birthday.getFullYear();
        return d + '/' + m + '/' + y
    }
    const content = data.content;
    const name = data.name;
    const sex = data.sex;
    const birthday = formatDate(data.birthday);

    let pdfmain, pdfcover;

	const options = {
        format: 'A4',
        border: {
            "top": "0.8in",            // default is 0, units: mm, cm, in, px
            "right": "0.8in",
            "bottom": "0.8in",
            "left": "0.8in"
        }
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
            <body>
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
                    <div style="font-size: larger; border: 2px dashed #0070C0; border-radius: 30px; display: inline-block; padding: 10px 150px 10px 20px; background-color: #E7E6E6; margin-top: 30px;">
                        <p>Họ và tên: <span style="text-transform: uppercase; font-weight: bold;">${name}</span></p>
                        <p>Sinh nhật: <span style="font-weight: bold;">${birthday}</span></p>
                        <p>Họ và tên: <span style="text-transform: capitalize; font-weight: bold;">${sex}</span></p>
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
                <div>
                    <h2 style="text-align: center;">4 THÁCH THỨC</h2>
                    <p>
                    Mỗi chúng ta sinh ra đều có cả điểm mạnh và điểm yếu. Thần số học nhìn cuộc sống
                    như thể đó là một quá trình giáo dục nhằm phát huy và nâng cao tài năng của chúng ta,
                    biến điểm yếu thành điểm mạnh. Điều này nhằm giúp hoàn thiện bản thể của chúng ta.                
                    </p>
                    <p>
                    Công việc trở nên toàn vẹn là trong đó chúng ta phải đối mặt với những điểm yếu của
                    bản thân và có ý thức rèn luyện để hoàn thiện nó. Có 4 Thách thức chúng ta phải đối mặt
                    trong cuộc sống. Nhiều người trong chúng ta sẽ gặp lại cùng một thách thức nhiều lần,
                    trong khi những người khác có 4 thách thức khác nhau để học.                
                    </p>
                    <p>
                    Những Thách thức trên Đường đời của bạn cung cấp những bài học cụ thể mà bạn phải
                    tham gia để truyền cảm hứng và giúp bạn, cuộc sống sẽ đặt bạn vào những tình huống
                    đòi hỏi những đặc điểm cụ thể của những con số Thách thức của riêng bạn.
                    </p>
                    <p>
                    4 Thách thức bạn cần phải vượt qua trong suốt cuộc đời này sẽ ảnh hưởng đến bạn
                    trong các giai đoạn khác nhau của cuộc đời. Ngoại trừ Thách thức thứ 3 kéo dài từ khi
                    sinh ra cho đến khi chết (Thách thức chính). Những thách thức là những giai đoạn phải trải
                    qua trong cuộc sống của bạn, không giới hạn trong những năm cụ thể giống như Đỉnh cao
                    hay Chu kỳ cuộc sống.
                    </p>
                    <p>
                    Tất cả Thách thức của bạn là có sẵn trong ngày bạn sinh ra.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center;">THÁCH THỨC 1 (0-30/35t): ${content[6].number}</h2>
                    ${content[6].content}
                </div>
                <div>
                    <h2 style="text-align: center;">THÁCH THỨC 2 (30/35-55/60t): ${content[7].number}</h2>
                    ${content[7].content}
                </div>
                <div>
                    <h2 style="text-align: center;">THÁCH THỨC 3 (suốt đời): ${content[8].number}</h2>
                    ${content[8].content}
                </div>
                <div>
                    <h2 style="text-align: center;">THÁCH THỨC 4 (55/60-hết): ${content[9].number}</h2>
                    ${content[9].content}
                </div>
                <div>
                    <h2>Phần III: BẠN VÀ CON ĐƯỜNG CUỘC SỐNG CỦA BẠN</h2>
                    <p>
                    Bây giờ chúng ta sẽ xem xét các số trong biểu đồ của bạn bắt nguồn từ sự kết hợp của cả tên và
                    ngày sinh của bạn. Các con số trong phần này và phần tiếp theo sẽ giúp làm trơn tru con đường của
                    bạn. Khi bạn tìm hiểu thêm về bản thân, bạn có thể bắt đầu nhận ra những đặc điểm mà trước đây bạn
                    không biết.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center;">CẦU NỐI ĐƯỜNG ĐỜI/SỨ MỆNH</h2>
                    <p>
                    Cầu nối Đường đời/Sứ mệnh đập tan lớp vỏ bọc và mở ra bản chất con người. Tất cả chúng ta đều
                    nghĩ về việc chúng ta thực sự là ai. Chúng ta có tham vọng và cảm hứng cho chúng ta biết chúng ta
                    muốn trở thành ai. Thường thì chúng ta bị giằng xé giữa người mà chúng ta nghĩ chúng ta là và con
                    người thật của chúng ta vẫn bị giấu kín. Số cầu nối này giúp mọi người có được sự chấp nhận bản thân
                    và định hướng đúng đắn trong cuộc sống.
                    </p>
                    <p>
                    Đây là một cầu nối ẩn dụ giữa con người thật của bạn và danh tiếng mà bạn tạo ra cho chính bạn.
                    Khi bạn bước lên cây cầu, bạn tiến tới việc tiết lộ bạn là ai. Số cầu nối này chỉ bạn biết cách làm cho
                    mối quan hệ giữa số Đường đời và số Sứ mệnh của mình thuận lợi hơn và tương thích hơn.                    
                    </p>
                    <h2 style="text-align: center; color: #9FD319;">Số cầu nối : ${content[10].number}</h2>
                    ${content[10].content}
                </div>
                <div>
                    <h2 style="text-align: center;">TRƯỞNG THÀNH</h2>
                    <p>
                    Số trưởng thành của bạn cho thấy mong muốn tiềm ẩn dần dần xuất hiện ở độ tuổi từ 30 đến 35.
                    Mục tiêu này bắt đầu xuất hiện khi bạn hiểu rõ hơn về bản thân. Bạn nhận thức rõ hơn về con người
                    bạn, mục tiêu thực sự của bạn trong cuộc sống là gì và bạn muốn đặt hướng đi nào cho cuộc sống của
                    mình. Bạn không còn lãng phí thời gian và năng lượng cho những thứ không thuộc về bản chất của bạn.
                    </p>
                    <p>
                    Bất kể bạn bao nhiêu tuổi, cuộc sống của bạn đang được điều hướng tới một mục tiêu rất cụ thể.
                    Mục tiêu đó có thể được coi là một phần thưởng sau những nỗ lực hiện tại của bạn, thường thì bạn
                    không ý thức được nó.
                    </p>
                    <p>
                    Ảnh hưởng của số trưởng thành có thể xuất hiện từ thời thơ ấu nhưng chúng ta có xu hướng đánh
                    mất chúng sau đó. Nhưng dù thế nào thì nó vẫn tác động đến cuộc sống của bạn mọi lúc
                    </p>
                    <p>
                    Số trưởng thành của bạn bắt đầu có tác động sâu sắc hơn đến cuộc sống của bạn sau tuổi 35. Ảnh
                    hưởng của số này tăng dần khi bạn già đi.
                    </p>
                    <div class="number">${content[11].number}</div>
                    ${content[11].content}
                </div>
                <div>
                    <h2 style="text-align: center;">SỐ SUY NGHĨ HỢP LÝ</h2>
                    <p>
                    Đây là một con số đặc biệt phản ánh phong cách suy nghĩ và các kiểu ra quyết định của bạn. Tất
                    nhiên, nó không phải là một trong những con số cho thấy đường đời hay tiềm thức của bạn nhưng nó
                    cho thấy cơ chế của quá trình suy nghĩ của bạn. Về cơ bản, nó nói rất nhiều về khả năng hành động của
                    bạn trong các tình huống căng thẳng. Nó cho thấy chất lượng của các giải pháp bạn tìm thấy và các xu
                    hướng lựa chọn của bạn.
                    </p>
                    <p>
                    Nhiều người không thể nói chắc chắn họ có phong cách suy nghĩ nào vì rất khó để ước tính chính
                    xác bản thân. Bài đọc này sẽ giúp bạn hiểu nhóm các tư tưởng mà bạn thuộc về. Ngoài ra, nếu bạn có
                    thể biết được số suy nghĩ hợp lý của các đối tác bạn có thể xây dựng các chiến lược giao tiếp dựa trên
                    phong cách suy nghĩ của những người đó.                    
                    </p>
                    <div class="number">${content[12].number}</div>
                    ${content[12].content}
                </div>
                <div>
                    <h2 style="text-align: center;">CHU KỲ CUỘC SỐNG</h2>
                    <p>
                    Giống như hầu hết các câu chuyện, có ba phần trong cuộc sống của chúng ta:
                    </p>
                    <p>
                    Chu kỳ đầu tiên hoặc giai đoạn mở đầu: Chúng ta mò mẫm đi tìm bản chất thực sự của chúng ta.
                    Đồng thời, chúng ta đang cố gắng đối phó với các nhân tố tác động mạnh mẽ có mặt trong môi trường
                    sống của chúng ta. Ví dụ: cha mẹ và các điều kiện kinh tế xã hội của gia đình chúng ta…
                    </p>
                    <p>
                    Chu kỳ thứ hai - giai đoạn giữa của cuộc đời, mang đến sự xuất hiện dần dần của tài năng cá nhân
                    và sáng tạo của chúng ta. Phần đầu của chu kỳ này: 30 - 35 tuổi đại diện cho một cuộc đấu tranh để
                    tìm vị trí của chúng ta trên thế giới này, trong khi những năm cuối tuổi 30, 40 và đầu tuổi 50: chúng ta
                    nhìn thấy mức độ tự làm chủ và ảnh hưởng lớn hơn tới môi trường.
                    </p>
                    <p>
                    Chu kỳ thứ ba - cuối cùng, đại diện cho sự nở hoa nội tâm của chúng ta, như vậy bản chất thực sự
                    của chúng ta cuối cùng đã có kết quả. Chính trong chu kỳ này, người ta có mức độ thể hiện bản thân và
                    sức ảnh hưởng lớn nhất.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center; color: #0070C0">CHU KỲ 1 (0-33t): ${content[13].number}</h2>
                    ${content[13].content}
                    <h2 style="text-align: center; color: #FFFF00">CHU KỲ 2 (34-59t): ${content[14].number}</h2>
                    ${content[14].content}
                    <h2 style="text-align: center; color: #FFFF00">CHU KỲ 3 (60t-hết): ${content[15].number}</h2>
                    ${content[15].content}
                </div>                
                <div>
                    <h2 style="text-align: center;">4 CHU KỲ ĐỈNH CAO</h2>
                    <p>
                    “Đỉnh cao” là bốn chu kỳ dài hạn trên Đường đời của bạn. Mỗi “Đỉnh cao”đại diện cho một bài học
                    cụ thể mà bạn đang làm.
                    </p>
                    <p>
                    Các “Đỉnh cao” rất quan trọng. Sự chuyển đổi từ một “Đỉnh cao” sang “Đỉnh cao” kế tiếp bạn có thể
                    cảm nhận thấy rất rõ ràng. “Đỉnh cao” của bạn tiết lộ các điều kiện và sự kiện chung mà bạn sẽ trải qua
                    trong thời gian đó. “Đỉnh cao” mô tả môi trường hoặc thách thức thiết yếu mà bạn sẽ phải đối mặt. Bạn
                    có thể chuẩn bị cho thời gian phía trước bằng cách biết số “Đỉnh cao” sắp tới của mình
                    </p>
                    <p>
                    Việc chuyển đổi từ một “Đỉnh cao” sang kế tiếp thường được chuẩn bị trước khoảng 2 năm. Đó là 2
                    năm đặc biệt và thay đổi mạnh mẽ. Bạn có thể sẽ đưa ra một số quyết định thay đổi cuộc sống - hôn
                    nhân, công việc, sự nghiệp hoặc thay đổi lớn trong tính cách của bạn.
                    </p>
                    <p>
                    Có lẽ sự thay đổi mạnh mẽ nhất - bên trong cũng như bên ngoài - là sự chuyển đổi từ Đỉnh cao thứ
                    nhất sang Đỉnh cao thứ hai. Bạn bắt đầu cảm thấy tác động của sự thay đổi sắp tới này khoảng hai năm
                    trước. Đây thường là một quá trình chuyển đổi khó khăn, nhưng một khi đã vượt qua thường mang lại
                    cảm giác rõ ràng về phương hướng trong cuộc sống của một người. Nó cũng cung cấp cho bạn một
                    cảm giác vững chắc hơn nhiều về bản sắc của bạn. Đó là một cửa ngõ cho sự trưởng thành.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center; color: #109611">ĐỈNH CAO 1 (0-33t): ${content[16].number}</h2>
                    ${content[16].content}
                </div>
                <div>
                    <h2 style="text-align: center; color: #0070C0">ĐỈNH CAO 2 (33-42t): ${content[17].number}</h2>
                    ${content[17].content}
                </div>
                <div>
                    <h2 style="text-align: center; color: #0070C0">ĐỈNH CAO 3 (42-51t): ${content[18].number}</h2>
                    ${content[18].content}
                </div>
                <div>
                    <h2 style="text-align: center; color: #109611">ĐỈNH CAO 4 (42-51t): ${content[19].number}</h2>
                    ${content[19].content}
                </div>
                <div>
                    <h2>Phần IV: NHỮNG ĐẶC ĐIỂM CỤ THỂ CỦA BẠN</h2>
                </div>
                <div>
                    <h2 style="text-align: center;">SỐ CÂN BẰNG</h2>
                    <p>
                    Mỗi người đều có một phong cách ứng xử nhất định khi có điều gì đó tiêu cực xảy ra. Một số trở nên
                    tuyệt vọng và nhượng bộ, và những người khác rơi vào một cơn thịnh nộ.
                    </p>
                    <p>
                    Số cân bằng đến với chúng ta trong hoàn cảnh khó khăn. Nó chỉ cho chúng ta hành vi đúng đắn để
                    giải quyết vấn đề dễ dàng nhất có thể và không làm tổn thương những người xung quanh chúng ta.
                    Chúng ta thường mất kiểm soát và đưa ra quyết định cảm tính hoặc nói những lời dẫn đến hậu quả
                    không mong muốn.                    
                    </p>
                    <p>
                    Nếu bạn muốn tìm hiểu làm thế nào để tránh sự leo thang của vấn đề hoặc cách khắc phục tình
                    huống khi nó đã xuất hiện, số cân bằng sẽ cung cấp cho bạn.
                    </p>
                    <div class="number">${content[20].number}</div>
                    ${content[20].content}
                </div>
                <div>
                    <h2 style="text-align: center;">ĐAM MÊ TIỀM ẨN</h2>
                    <p>
                    Niềm đam mê tiềm ẩn của bạn cho thấy một hoặc nhiều sức mạnh và tài năng đặc biệt mà bạn dựa
                    vào và có sẵn cho bạn. Đam mê tiềm ẩn đại diện cho lĩnh vực chuyên môn cụ thể của bạn, hoặc một
                    tài năng tập trung.
                    </p>
                    <p>
                    Nói một cách ẩn dụ, tài năng này có thể được coi là có một sức mạnh riêng để định hình cuộc sống
                    của bạn. Sự tồn tại của nó mang đến cho bạn một khát vọng mạnh mẽ để phát triển và thể hiện khả
                    năng đặc biệt đó. Tài năng đòi hỏi bạn thể hiện nó, rằng bạn trải nghiệm phần này của bạn, và bạn sống
                    theo bản chất của nó. Theo cách này, đam mêm tiềm ẩn định hình tính cách và định hướng cuộc sống
                    của bạn.
                    </p>
                    <h2 style="text-align: center;">Đam mê tiềm ẩn ${content[21].number}</h2>
                    ${content[21].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NỀN TẢNG</h2>
                    <p>
                    Chữ cái đầu tiên của tên đầy đủ của bạn khi sinh được gọi là Nền tảng. Nó cung cấp
                    cho bạn một dấu hiệu của nhân vật của bạn, đặc biệt là trong cách bạn tiếp cận các cơ
                    hội và trở ngại.                    
                    </p>
                    <p>
                    Chữ cái cuối cùng của tên bạn cho thấy khả năng và thái độ của bạn đối với việc hoàn
                    thành các dự án mà bạn bắt đầu.
                    </p>
                    <h2 style="text-align: center; color:#EB5680;">NỀN TẢNG ${content[22].number}</h2>
                    ${content[22].content}
                </div>
                <div>
                    <h2 style="text-align: center;">TIỀM THỨC ẨN</h2>
                    <p>
                    Hầu hết mọi người trong cuộc sống này phải đối mặt với những trở ngại theo thời gian. Mặc dù chúng
                    tôi biết những bước chúng tôi cần phải thực hiện, chúng tôi thường không đối phó với chúng về mặt cảm
                    xúc. Rất nhiều người tự trách mình vì những vấn đề xảy ra trong cuộc sống của họ, và phản ứng cảm
                    xúc mạnh mẽ đến mức bản thân vấn đề dường như không quá lớn. Tuy nhiên, hầu hết chúng ta quên
                    mất những điểm mạnh và lợi thế có thể và phải được sử dụng trong những tình huống chúng ta cần bảo
                    vệ bản thân hoặc chứng minh ai đó sai. Số tự tin tiềm thức hoặc tiềm thức của bạn có nghĩa là để giúp
                    bạn nhấn mạnh những đặc điểm đó trong bạn, đó là chìa khóa để vượt qua những trở ngại. Những đặc
                    điểm này đôi khi sẽ giúp bạn giải quyết chỉ một phần của vấn đề, đôi khi giúp bạn bình tĩnh vượt qua
                    mọi thứ và đôi khi là công cụ chính của bạn để thoát khỏi rắc rối. Con số này cho thấy các đặc điểm
                    mà bạn cần phát triển để phản ứng với những rắc rối bất ngờ dưới bất kỳ hình thức nào.                    
                    </p>
                    <h2 style="text-align: center; color:#00B0F0;">Tiềm thức ẩn ${content[23].number}</h2>
                    ${content[23].content}
                </div>
                <div>
                    <h2 style="text-align: center;">4 CẤP ĐỘ THỂ HIỆN CỦA SỨ MỆNH</h2>
                    <p>
                    Mỗi người trải nghiệm cuộc sống ở bốn cấp độ khác nhau: cơ thể vật lý, tinh thần, cảm xúc và trực
                    giác. Mỗi lĩnh vực này nhận thức và xử lý một loại thông tin cụ thể.                    
                    </p>
                    <p>
                    Cơ thể vật lý có khả năng chạm, nếm, khoái cảm và đau đớn. Nó cung cấp cho chúng ta một cảm
                    giác về thế giới vật chất. Tinh thần, cảm xúc và trực giác nhận thức về thế giới vô hình.
                    </p>
                    <p>
                    Bốn yếu tố này tồn tại trong tất cả chúng ta nhưng mỗi người lại có một yếu tố chiếm ưu thế. Nó
                    được thể hiện thường xuyên hoặc mãnh liệt hơn các yếu tố khác.
                    </p>
                    <p>
                    Cấp độ vật lý phản ánh cách chúng ta xử lý sức mạnh của mình.
                    </p>
                    <p>
                    Cấp độ tinh thần phản ánh loại suy nghĩ nào chúng ta có và cách chúng ta lên kế hoạch hành động
                    kỹ lưỡng.
                    </p>
                    <p>
                    Cấp độ cảm xúc thể hiện hình ảnh tình cảm của bạn.
                    </p>
                    <p>
                    Cấp độ trực giác cho thấy thế giới nội tâm của bạn, nguồn cảm hứng và mức độ cân bằng của bạn.
                    Đó là một chỉ số liên quan tới tâm linh của bạn. Trực giác cho bạn cái nhìn về thế giới trong nháy mắt,
                    không thông qua lý trí.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center; color:#9FD319;">CẤP ĐỘ VẬT LÝ ${content[24].number} (1)</h2>
                    ${content[24].content}
                    <h2 style="text-align: center; color:#EB5680;">CẤP ĐỘ TINH THẦN ${content[25].number} (1)</h2>
                    ${content[25].content}
                    <h2 style="text-align: center; color:#FFFF00;">CẤP ĐỘ CẢM XÚC ${content[26].number} (2)</h2>
                    ${content[26].content}
                    <h2 style="text-align: center; color:#0070C0;">CẤP ĐỘ TRỰC GIÁC ${content[27].number} (5)</h2>
                    ${content[27].content}
                </div>
                <div>
                    <h2>Phần V: NHỮNG ĐẶC TRƯNG VÀ TÍNH CHẤT 3 NĂM TỚI</h2>
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN</h2>
                    <p>
                    Số “Năm cá nhân” của bạn là một dấu hiệu mạnh mẽ về các xu hướng và hoàn cảnh bạn sẽ trải qua
                    trong một năm. Chu kỳ “Năm cá nhân” của bạn dựa trên chu kỳ Năm Quốc tế và do đó chạy đồng thời
                    với năm dương lịch.
                    </p>
                    <p>
                    Có 9 “Năm cá nhân” tạo nên một vòng tròn hoàn chỉnh.
                    </p>
                    <p>
                    Mỗi một vòng cho thấy sự tiến triển hay sự tiến hóa một phần cụ thể trong sự tăng trưởng của bạn.
                    Sự tiến bộ của bạn có thể được nhìn thấy rất logic, từ giai đoạn trứng nước hoặc bắt đầu một giai đoạn
                    tăng trưởng trong cuộc đời bạn, cho đến khi kết thúc của quá trình đó. “Năm cá nhân” số 1 chỉ ra những
                    bước đầu tiên của bạn theo một hướng mới. Những năm tiếp theo cho thấy sự tiến bộ của bạn trên con
                    đường này, kết thúc 9 “Năm cá nhân” của bạn, hoàn thành một chu kỳ. Dưới đây là một mô tả về “Năm
                    cá nhân” hiện tại của bạn và 2 năm tiếp theo. Nó cho biết bạn đang ở đâu trên chiếc xe 9 năm.                    
                    </p>
                    <p>
                    Năm cá nhân hình thành các bước xây dựng và đánh dấu sự tiến bộ của bạn trong suốt cuộc đời.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center; color:#9FD319;">NĂM CÁ NHÂN 2020: ${content[28].number}</h2>
                    ${content[28].content}
                </div>
                <div>
                    <h2 style="text-align: center; color:#00B0F0;">NĂM CÁ NHÂN 2021: ${content[29].number}</h2>
                    ${content[29].content}
                </div>
                <div>
                    <h2 style="text-align: center; color:#0070C0;">NĂM CÁ NHÂN 2022: ${content[30].number}</h2>
                    ${content[30].content}
                </div>
                <div>
                    <h2 style="text-align: center;">CHU KỲ TINH HOA</h2>
                    <p>
                    Số “Tinh hoa” và số “Năm cá nhân” là hai chỉ số thiết yếu của các tác động sẽ ảnh hưởng đến cuộc
                    sống của bạn trong suốt năm của bất kỳ năm nào.
                    </p>
                    <p>
                    Trong khi chu kỳ Năm cá nhân diễn ra từ tháng 1 đến tháng 1, thì chu kỳ Tinh hoa được cảm nhận
                    mạnh mẽ nhất từ sinh nhật đến sinh nhật. Ví dụ, nếu chu kỳ Tinh hoa của bạn là 8 cho năm 2019, bạn
                    sẽ bắt đầu cảm thấy ảnh hưởng của số 8 đó một cách mạnh mẽ nhất sau sinh nhật năm 2019 của bạn.
                    Ảnh hưởng sẽ bắt đầu suy yếu dần trong năm 2019 và cuối cùng sẽ kết thúc vào sinh nhật năm 2020
                    của bạn.
                    </p>
                    <p>
                    Số Tinh hoa chỉ ra những bài học bạn sẽ giải quyết trong năm đó. Nó nói rất nhiều về cách bạn sẽ
                    nhận thức môi trường của bạn. Nó cũng đưa ra lời khuyên rõ ràng để bạn có thể thành công nhất trong
                    năm, nghĩa là loại hành vi nào sẽ được hỗ trợ bởi môi trường của bạn, và loại nào sẽ kém hiệu quả hơn.
                    </p>
                </div>
                <div>
                    <h2 style="text-align: center; color:#EB5680;">CHU KỲ TINH HOA 2020: ${content[31].number}</h2>
                    ${content[31].content}
                </div>
                <div>
                    <h2 style="text-align: center; color:#EB5680;">CHU KỲ TINH HOA 2021: ${content[32].number}</h2>
                    ${content[32].content}
                </div>
                <div>
                    <h2 style="text-align: center; color:#EB5680;">CHU KỲ TINH HOA 2022: ${content[33].number}</h2>
                    ${content[33].content}
                </div>
            </body>
        </html>
    </body>
</html>

    `, options).toBuffer(async (err, buffer) => {
        pdfmain = buffer;
        if (pdfmain && pdfcover) {
            const merged = await merge([pdfcover, pdfmain]);
            res.end(merged, 'binary');
        }
    });

    pdf.create(`
        <html>
            <body style="margin: 0;">
                <div id="bia" style="position: relative; padding: 0;">
                    <img style="width:5in;height:5in;" src="${process.env.BACKEND_URL}/img/cover.png">
                    <div style="position: absolute; bottom: 1.3in; width: 100%;text-align: center;"><span style="font-size:24pt;color:#fff;text-transform: uppercase;">${name} ${birthday}</span></div>
                </div>
            </body>
        </html>
        `, ).toBuffer(async (err, buffer) => {
            pdfcover = buffer;
            if (pdfmain && pdfcover) {
                const merged = await merge([pdfcover, pdfmain]);
                res.end(merged, 'binary');
            }
        });
      
});
module.exports = router;