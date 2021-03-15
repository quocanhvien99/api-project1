const router = require('express').Router();
var pdf = require('html-pdf');
const { merge } = require('merge-pdf-buffers');
const authentication = require('../authentication');
const Report = require('../models/Report');
const User = require('../models/User');
const Content = require('../models/Content');

const { reportValidation } = require('../validation');

router.post('/', authentication, async (req, res) => {
	//Validate data
	const { error } = reportValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let numbFromName = nameToNumber(req.body.name);
	let c = 0;
	let arr = [];
	for (let i = 0; i < 32; i++) {
		arr.push(numbFromName[c++]);
		if (c > numbFromName.length - 1) c = 0;
	}
	let temp = await Promise.all([
		Content.find({ key: 'ĐƯỜNG ĐỜI', number: arr[0] }),
		Content.find({ key: 'SỨ MỆNH', number: arr[1] }),
		Content.find({ key: 'TRƯỞNG THÀNH', number: arr[2] }),
		Content.find({ key: 'CẦU NỐI ĐƯỜNG ĐỜI/SỨ MỆNH', number: arr[3] }),
		Content.find({ key: 'SỐ NGÀY SINH', number: arr[4] }),
		Content.find({ key: 'KHÁT TÂM', number: arr[5] }),
		Content.find({ key: 'NHÂN CÁCH', number: arr[6] }),
		Content.find({ key: 'CẦU NỐI KHÁT TÂM/NHÂN CÁCH', number: arr[7] }),
		Content.find({ key: 'ĐAM MÊ TIỀM ẨN', number: arr[8] }),
		Content.find({ key: 'BÀI HỌC CUỘC SỐNG', number: arr[9] }),
		Content.find({ key: 'TIỀM THỨC ẨN', number: arr[10] }),
		Content.find({ key: 'SỐ SUY NGHĨ HỢP LÝ', number: arr[11] }),
		Content.find({ key: 'SỐ CÂN BẰNG', number: arr[12] }),
		Content.find({ key: 'NỀN TẢNG', number: arr[13] }),
		Content.find({ key: 'THỂ CHẤT', number: arr[14] }),
		Content.find({ key: 'TINH THẦN', number: arr[15] }),
		Content.find({ key: 'CẢM XÚC', number: arr[16] }),
		Content.find({ key: 'TRỰC GIÁC', number: arr[17] }),
		Content.find({ key: 'CHU KỲ 1', number: arr[18] }),
		Content.find({ key: 'CHU KỲ 2', number: arr[19] }),
		Content.find({ key: 'CHU KỲ 3', number: arr[20] }),
		Content.find({ key: 'ĐỈNH CAO 1', number: arr[21] }),
		Content.find({ key: 'ĐỈNH CAO 2', number: arr[22] }),
		Content.find({ key: 'ĐỈNH CAO 3', number: arr[23] }),
		Content.find({ key: 'ĐỈNH CAO 4', number: arr[24] }),
		Content.find({ key: 'THÁCH THỨC 1', number: arr[25] }),
		Content.find({ key: 'THÁCH THỨC 2', number: arr[26] }),
		Content.find({ key: 'THÁCH THỨC 3', number: arr[27] }),
		Content.find({ key: 'THÁCH THỨC 4', number: arr[28] }),
		Content.find({ key: 'NĂM CÁ NHÂN 2021', number: arr[29] }),
		Content.find({ key: 'NĂM CÁ NHÂN 2022', number: arr[30] }),
		Content.find({ key: 'NĂM CÁ NHÂN 2023', number: arr[31] }),
	]);
	let content = [];

	temp.map((item) => {
		content.push({
			content: item[0].content,
			number: item[0].number,
			key: item[0].key,
		});
	});

	const formatDate = (birthday) => {
		birthday = new Date(birthday);
		const d = birthday.getDate();
		const m = birthday.getMonth() + 1;
		const y = birthday.getFullYear();
		return d + '/' + m + '/' + y;
	};
	const name = req.body.name;
	const sex = req.body.sex;
	const birthday = formatDate(req.body.birthday);

	var projectRoot = process.cwd();
	projectRoot = projectRoot.replace(/\\/g, '/');

	let pdfmain, pdfcover;

	const options = {
		format: 'A4',
		border: {
			top: '0.8in', // default is 0, units: mm, cm, in, px
			right: '0.8in',
			bottom: '0.8in',
			left: '0.8in',
		},
	};

	pdf
		.create(
			`
    <html>
    <head>
        <style>
            html{zoom: 0.7;}
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
                position: relative;
            }
            .number > .value {
                position: absolute;
                width: 100%;
                top: 30%;
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

            .name {
                display: -webkit-flex;
	            flex-direction: row;
            }
            .name > div {
                width: 20px;
                font-size: large;
                font-weight: bolder;
            }
            .name > div > div {
                width: 20px;
                border: 1px solid #000;
                text-align: center;
            }
            .name > .space {
                width: 20px;
            }
            .nentang {
                font-weight: bold;
            }
            .nentang > div {
                display: -webkit-flex;
            }
            .nentang > div > div {
                border: 1px solid #000;
                padding: 3px 0;
                text-align: center;
            }
            .nentang > div > div:first-child {
                width: 100px;
                margin-right: 30px;
            }
            .nentang > div > div:last-child {
                width: 40px;
                font-size: large;
            }
            .tongquan {
                background-color: #e7e6e6;
                border: 2px dashed #a1a1ea;
                width: 230px;
                font-size: larger;
                color: #393afa;
                padding: 10px;
            }
            .tongquan > div > div:first-child {
                float: left;
            }
            .tongquan > div > div:last-child {
                overflow: hidden;
                text-align: right;
                font-weight: bold;
            }        
        </style>
    </head>

    <body>
                <div id="mucluc">
                    <h1 style="text-transform: uppercase; text-align: center;">Mục lục báo cáo</h1>
                    <p>• Thông tin khách hàng</p>
                    <p>• Quy trình báo cáo Thần số học</p>
                    <p>I. LA BÀN ĐỊNH VỊ CUỘC ĐỜI</p>
                    <p>• Số đường đời</p>
                    <p>• Số sứ mệnh</p>
                    <p>• Số trưởng thành</p>
                    <p>• Số cầu nối</p>
                    <p>II. HÀNH TRANG VÀO ĐỜI</p>
                    <p>• Số ngày sinh</p>
                    <p>• Con số Trường thành</p>
                    <p>• Số khát tâm</p>
                    <p>• Số nhân cách</p>
                    <p>• Đam mê tiềm ẩn</p>
                    <p>• Bài học cuộc đời</p>
                    <p>• Tiềm thức ẩn</p>
                    <p>• Số suy nghĩ hợp lý</p>
                    <p>• Số cân bằng</p>
                    <p>• Số nền tảng</p>
                    <p>• 4 mặt phẳng biểu hiện</p>
                    <p>III. CHU KỲ CUỘC SỐNG – ĐỈNH CAO & THÁCH THỨC</p>
                    <p>• 3 Chu kỳ sống</p>
                    <p>• 4 đỉnh cao</p>
                    <p>• 4 thách thức</p>
                    <p>• Năm cá nhân</p>
                    <p>• Biểu đồ số cá nhân</p>
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
                    </div>                    
                </div>
                <div>
                    <h2 style="text-align: center; margin-bottom: 50px;">TỔNG QUAN CÁC CON SỐ CỦA BẠN</h2>
                    <div style="position: relative;">
                        <div class="name">
                            ${nameToNumberHtml(name)}
                        </div>
                        <div style="position: absolute; right: 200px; top: 0; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_65.png" style="width: 65px">
                            <div class="value" style="text-align: center; font-size:large; position: relative; top: -40px">${
															content[5].number
														}</div> 
                        </div>
                        <div style="position: absolute; right: 0; top: -20px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_59.png" style="width: 65px">
                            <div style="text-align: center; font-size:large; position: relative; top: -60px">${
															content[2].number
														}</div> 
                        </div>
                        <div style="position: absolute; right: 0; top: 120px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_71.png" style="width: 65px">
                            <div style="text-align: center; font-size:large; position: relative; top: -45px">${
															content[12].number
														}</div> 
                        </div>
                        <div style="position: absolute; right: 200px; top: 120px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_67.png" style="width: 65px">
                            <div class="value" style="text-align: center; font-size:large; position: relative; top: -40px">${
															content[6].number
														}</div> 
                        </div>
                        <div style="position: absolute; right: 100px; top: 60px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_57.png" style="width: 65px">
                            <div class="value" style="text-align: center; font-size:large; position: relative; top: -30px">${
															content[1].number
														}</div> 
                        </div>
                        <div style="position: absolute; left: 0; top: 120px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_53.png" style="width: 65px">
                            <div class="value" style="text-align: center; font-size:large; position: relative; top: -40px">${
															content[0].number
														}</div> 
                        </div>
                        <div style="position: absolute; left: 0; top: 300px; font-weight: bold;">
                            <img src="file:///${projectRoot}/public/img/vi_69.png" style="width: 65px">
                            <div class="value" style="text-align: center; font-size:large; position: relative; top: -40px">${
															content[11].number
														}</div> 
                        </div>
                        <div class="nentang" style="position: absolute; right: 50px; top: 270px;">
                            <div>
                                <div>THỂ CHẤT</div>
                                <div style="background-color: ${getColor(
																	content[14].number
																)};">${content[14].number}</div>
                            </div>
                            <div>
                                <div>TINH THẦN</div>
                                <div style="background-color: ${getColor(
																	content[15].number
																)};">${content[15].number}</div>
                            </div>
                            <div>
                                <div>CẢM XÚC</div>
                                <div style="background-color: ${getColor(
																	content[16].number
																)};">${content[16].number}</div>
                            </div>
                            <div>
                                <div>TRỰC GIÁC</div>
                                <div style="background-color: ${getColor(
																	content[17].number
																)};">${content[17].number}</div>
                            </div>
                        </div>
                        <div class="tongquan" style="position: absolute; left: 20px; top: 420px;">
                            <div>
                                <div>Đường đời:</div>
                                <div>${content[0].number}</div>
                            </div>
                            <div>
                                <div>Sứ mệnh:</div>
                                <div>${content[1].number}</div>
                            </div>
                            <div>
                                <div>Trưởng thành:</div>
                                <div>${content[2].number}</div>
                            </div>
                            <div>
                                <div>Cầu nối L/E:</div>
                                <div>${content[3].number}</div>
                            </div>
                            <div>
                                <div>Ngày sinh:</div>
                                <div>${content[4].number}</div>
                            </div>
                            <div>
                                <div>Khát tâm:</div>
                                <div>${content[5].number}</div>
                            </div>
                            <div>
                                <div>Nhân cách: </div>
                                <div>${content[6].number}</div>
                            </div>
                            <div>
                                <div>Cầu nối H/P:</div>
                                <div>${content[7].number}</div>
                            </div>
                            <div>
                                <div>Tiềm thức ẩn:</div>
                                <div>${content[10].number}</div>
                            </div>
                        </div>       
                        <div class="tongquan" style="position: absolute; right: 20px; top: 420px;">
                            <div>
                                <div>Đam mê tiềm ẩn:</div>
                                <div>${content[8].number}</div>
                            </div>
                            <div>
                                <div>Bài học cuộc sống:</div>
                                <div>${content[9].number}</div>
                            </div>
                            <div>
                                <div>Con số cân bằng:</div>
                                <div>${content[12].number}</div>
                            </div>
                            <div>
                                <div>Suy nghĩ hợp lý:</div>
                                <div>${content[11].number}</div>
                            </div>
                            <div>
                                <div>Số nền tảng:</div>
                                <div>${content[13].number}</div>
                            </div>
                            <div>
                                <div>Thể chất:</div>
                                <div>${content[14].number}</div>
                            </div>
                            <div>
                                <div>Tinh thần: </div>
                                <div>${content[15].number}</div>
                            </div>
                            <div>
                                <div>Cảm xúc:</div>
                                <div>${content[16].number}</div>
                            </div>
                            <div>
                                <div>Trực giác:</div>
                                <div>${content[17].number}</div>
                            </div>
                        </div>
                        <div class="tongquan" style="width: 400px; position: absolute; left: 100px; top: 700px;">
                            <div>
                                <div>Chu kỳ cuộc sống:</div>
                                <div>${content[18].number}-${
				content[19].number
			}-${content[20].number}</div>
                            </div>
                            <div>
                                <div>Chu kỳ Đỉnh cao:</div>
                                <div>${content[21].number}-${
				content[22].number
			}-${content[23].number}-${content[24].number}</div>
                            </div>
                            <div>
                                <div>Chu kỳ Thách thức:</div>
                                <div>${content[25].number}-${
				content[26].number
			}-${content[27].number}-${content[28].number}</div>
                            </div>
                            <div>
                                <div>Số của năm 21-22-23:</div>
                                <div>${content[29].number}-${
				content[30].number
			}-${content[31].number}</div>
                            </div>
                        </div>                   
                    </div>
                    
                </div>
                <div>
                    <h2>Phần I: LA BÀN ĐỊNH VỊ CUỘC ĐỜI</h2>
                    <p>
                    Hơi thở đầu tiên của bạn đánh dấu sự khởi đầu của hành trình của bạn trên con đường được
                    gọi là hành trình cuộc sống của bạn. Những con số quan trọng nhất trong biểu đồ thần số học của
                    bạn đến từ tên và ngày sinh của bạn. Số Đường đời của bạn đưa ra một phác thảo rộng rãi về các
                    cơ hội, thách thức và bài học bạn gặp trong suốt cuộc đời. Số Sứ mệnh cho bạn tầm nhìn dài hạn
                    về cuộc sống. Những phần tiếp theo sẽ cho bạn thấy các đặc điểm chi tiết hơn về bạn để từ đó xây
                    dựng một bức tranh tổng thể độc đáo của riêng bạn.
                    </p>                 
                </div>
                <div>
                    <h2 style="text-align: center;">CON SỐ ĐƯỜNG ĐỜI</h2>
                    <p>
                    Nếu có một khoảnh khắc biến đổi hoàn toàn, đó là khoảnh khắc bạn được sinh ra. Ngay lúc đó,
                    bạn bước qua cánh cửa vào một thực tại mới - cuộc sống con người. Con số quan trọng nhất
                    trong bản đồ Thần số của bạn dựa trên ngày sinh của bạn.
                    </p>
                    <p>
                    Ngay tại thời điểm đó, bạn là một người độc đáo và độc nhất như chính mã ADN hay dấu vân
                    tay của bạn. Tất cả mọi thứ đã được sắp đặt sẵn cho bạn giống như một cuộc chơi sắp bắt đầu.
                    Cuộc sống với những tiềm năng đã được chuẩn bị cho bạn, bạn hoàn toàn tự do để sống cuộc đời
                    mình mong muốn. Phát huy toàn bộ tiềm năng trong bạn hay tạo ra một số phiên bản nhỏ hơn
                    của chính bạn - tất cả phụ thuộc vào sự nỗ lực và cam kết của bạn. Tiềm năng luôn tồn tại trong
                    bạn, còn bạn là người đưa ra quyết định để biến chúng thành hiện thực. Đó là lựa chọn của bạn.
                    Thời điểm bạn sinh ra chính là một con số tiềm ẩn
                    </p>
                    <p>
                    Con số Đường đời cho bạn một cái nhìn rộng về những cơ hội, thách thức và bài học mà bạn sẽ
                    gặp trong cuộc đời này. Số Đường đời của bạn là thông tin quan trọng nhất có sẵn trong bạn.
                    </p>                    
                    <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_53.png">
                        <div class="value">${content[0].number}</div> 
                    </div>
                    ${content[0].content}
                </div>
                <div>
                    <h2 style="text-align: center;">SỐ SỨ MỆNH</h2>
                    <p>
                    Số Sứ mệnh cho thấy sự cấu thành từ thể chất và tinh thần của bạn, định hướng hay mục tiêu
cuộc sống của bạn. Nó đại diện cho một mục tiêu trọn đời mà bạn đang nhắm tới. Bạn làm việc để
hoàn thành tiềm năng này mỗi ngày trong cuộc sống của bạn. Do đó, số Sứ mệnh cho thấy mục
tiêu bên trong của bạn, con người mà bạn muốn trở thành.
                    </p>
                    <p>
                    Số Sứ mệnh cho thấy tài năng, khả năng và những thiếu sót đã ở bên bạn khi bạn bước vào cơ
thể con người. Tên của bạn và những con số bắt nguồn từ nó cho thấy sự phát triển cũng như
những tài năng và vấn đề trong suốt cuộc đời của bạn.
                    </p>
                    <p>
                    Đối với những người chấp nhận thuyết “Luân hồi”, sự rung động của tên đầy đủ của bạn có thể
được xem là toàn bộ sự tiến hóa cá nhân của bạn, kinh nghiệm, tài năng và trí tuệ tích lũy qua
nhiều kiếp sống. Mỗi trải nghiệm, dù lớn hay nhỏ, dọc theo con đường tiến hóa này đã ảnh hưởng
đến sự phát triển của bạn và đưa bạn đến trạng thái hiện tại.
                    </p>
                    <p>
                    Sứ mệnh là bản thể của bạn. Đường đời là bài học lớn mà bạn đang cố gắng học trong cuộc
sống này. Nhân cách của bạn sẽ xuất hiện dần dần qua thời gian.
                    </p>
                    <p>
                    Số Sứ mệnh của bạn giúp bạn hiểu được bản chất cơ bản và các khả năng cũng như vấn đề vốn
có trong bản thể của bạn.
                    </p>
                    <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_57.png">
                        <div class="value">${content[1].number}</div> 
                    </div>
                    ${content[1].content}
                </div>
                <div>
                    <h2 style="text-align: center;">TRƯỞNG THÀNH</h2>
                    <p>
                    Số trưởng thành của bạn cho thấy mong muốn tiềm ẩn dần dần xuất hiện ở độ tuổi từ 30 đến
35. Mục tiêu này bắt đầu xuất hiện khi bạn hiểu rõ hơn về bản thân. Bạn nhận thức rõ hơn về con
người bạn, mục tiêu thực sự của bạn trong cuộc sống là gì và bạn muốn đặt hướng đi nào cho
cuộc sống của mình. Bạn không còn lãng phí thời gian và năng lượng cho những thứ không thuộc
về bản chất của bạn
                    </p>
                    <p>
                    Bất kể bạn bao nhiêu tuổi, cuộc sống của bạn đang được điều hướng tới một mục tiêu rất cụ
thể. Mục tiêu đó có thể được coi là một phần thưởng sau những nỗ lực hiện tại của bạn, thường
thì bạn không ý thức được nó.
                    </p>
                    <p>
                    Ảnh hưởng của số trưởng thành có thể xuất hiện từ thời thơ ấu nhưng chúng ta có xu hướng
đánh mất chúng sau đó. Nhưng dù thế nào thì nó vẫn tác động đến cuộc sống của bạn mọi lúc
                    </p>
                    <p>
                    Số trưởng thành của bạn bắt đầu có tác động sâu sắc hơn đến cuộc sống của bạn sau tuổi 35.
Ảnh hưởng của số này tăng dần khi bạn già đi.
                    </p>
                    <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_59.png">
                        <div class="value">${content[2].number}</div> 
                    </div>
                    ${content[2].content}
                </div>
                <div>
                    <h2 style="text-align: center;">CẦU NỐI ĐƯỜNG ĐỜI/SỨ MỆNH</h2>
                    <p>
                    Cầu nối Đường đời/Sứ mệnh đập tan lớp vỏ bọc và mở ra bản chất con người. Tất cả chúng ta
đều nghĩ về việc chúng ta thực sự là ai. Chúng ta có tham vọng và cảm hứng cho chúng ta biết
chúng ta muốn trở thành ai. Thường thì chúng ta bị giằng xé giữa người mà chúng ta nghĩ chúng
ta là và con người thật của chúng ta vẫn bị giấu kín. Số cầu nối này giúp mọi người có được sự
chấp nhận bản thân và định hướng đúng đắn trong cuộc sống.
                    </p>
                    <p>
                    Đây là một cầu nối ẩn dụ giữa con người thật của bạn và danh tiếng mà bạn tạo ra cho chính
bạn. Khi bạn bước lên cây cầu, bạn tiến tới việc tiết lộ bạn là ai. Số cầu nối này chỉ bạn biết cách
làm cho mối quan hệ giữa số Đường đời và số Sứ mệnh của mình thuận lợi hơn và tương thích
hơn.
                    </p>
                    <h2 style="text-align: center;">Số cầu nối: ${
											content[3].number
										}</h2>
                    ${content[3].content}
                </div>
                <div>
                    <h2>Phần II: HÀNH TRANG VÀO ĐỜI</h2>
                    <p>
                    Những đặc điểm chi tiết về bạn ở phần này sẽ giúp bạn nhìn nhận rõ ràng hơn về bản thân
trong những trường hợp và hoàn cảnh cụ thể.
                    </p>
                </div>
                <div>
                <h2 style="text-align: center;">SỐ NGÀY SINH</h2>
                <p>
                Sự ra đời của một cá nhân là một kỳ quan thực sự xảy ra mỗi ngày. “Mỗi người là duy nhất" -
đó là sự thật và Thần số học biết điều đó. Sẽ không có khoảnh khắc nào khác như thế này. Số sinh
nhật đại diện cho những đặc điểm, lĩnh vực chuyên môn hoặc kỹ năng bạn cần phát triển và bạn sẽ
thành công nếu bạn kết nối cuộc sống của mình với nó. Mỗi ngày trong tháng có những đặc điểm
riêng được gán cho những người sinh ra dưới mỗi ngày đó. Điều đó không có nghĩa là một người
không có lựa chọn nào khác ngoài việc phát triển chúng. Tuy nhiên, hành trình trong cuộc sống sẽ
dễ dàng hơn nhiều nếu cá nhân đó tiến bộ trong một điều gì đó mà người ta có thiên hướng cụ
thể. Số sinh nhật của bạn có thể tiết lộ đặc điểm bẩm sinh tích cực và tiêu cực của bạn.
                </p>
                <p>
                Bạn cần biết số sinh nhật của mình vì nó có thể thực hiện công việc của một chiếc la bàn trong
việc hướng dẫn bạn trong suốt cuộc đời. Bạn không chỉ nhận biết những đặc điểm tích cực và tiêu
cực của bạn; bạn có thể thấy những gì bạn có thể và làm như thế nào dễ nhất để có được cuộc
sống tốt nhất.
                </p>
                <h2 style="text-align: center;">NGÀY SINH: ${
									content[4].number
								}</h2>
                ${content[4].content}
                </div>
                <div>
                <h2 style="text-align: center;">KHÁT TÂM</h2>
                <p>
                Khát tâm là nội tâm của bạn. Nó cho thấy sự thôi thúc tiềm ẩn, động lực thực sự của bạn. Nó
tiết lộ ý định chung đằng sau nhiều hành động của bạn.
                </p>
                <p>
                Do đó, nó ảnh hưởng đáng kể đến các lựa chọn bạn thực hiện trong cuộc sống. Số Khát tâm
được xem là một phần của bức tranh lớn, được gọi là những con số cốt lõi, bao gồm Đường đời,
Sứ mệnh, Ngày bạn được sinh ra và Nhân cách. Nhưng mỗi con số là một khía cạnh khác của bạn.
                </p>
                <p>
                Số Sứ mệnh cho thấy tài năng và khả năng của bạn, và định hướng chung của bạn trong cuộc
sống. Số Đường đời là bài học trung tâm bạn đến thế giới này để học hỏi. Ngày bạn được sinh ra
có mối liên hệ rất chặt chẽ với Đường đời của bạn. Nó tiết lộ những tài năng cụ thể mà bạn sở
hữu, sẽ hữu ích cho bạn trong việc thực hiện Đường đời của bạn. Số Nhân cách tiết lộ cách mọi
người có xu hướng nhìn thấy bạn. Nó cũng cho thấy những đặc điểm bạn đang thể hiện ra với thế
giới. Số Khát tâm thể hiện bản sắc tâm hồn của bạn.
                </p>
                <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_65.png">
                        <div class="value">${content[5].number}</div> 
                </div>
                ${content[5].content}
                </div>
                <div>
                <h2 style="text-align: center;">NHÂN CÁCH</h2>
                <p>
                Nhân cách là cách bạn thể hiện ra bên ngoài cho thế giới, đó là bản chất thật của bạn. Đó là
                những khía cạnh mà bạn cảm thấy thoải mái khi chia sẻ với mọi người ngay từ đầu của một mối
                quan hệ. Qua thời gian và sự tin tưởng, người khác mới có thể hiểu sâu hơn về bản chất của bạn;
                con người thực sự, thực tế, khát hao, Sứ mệnh của bạn, v.v.
                </p>
                <p>
                Số Nhân cách của bạn thường đóng vai trò là một thiết bị kiểm duyệt về những gì bạn gửi đi
                và những gì bạn cho phép tiếp cận. Nó phân biệt đối xử trong các loại người và loại thông tin đưa
                trái tim và tâm trí của bạn. Vì lý do này, nhân cách của bạn thường hẹp hơn và bảo vệ theo định
                nghĩa của nó so với con người thực của bạn. Nó có thể sàng lọc một số điều bạn không muốn giải
                quyết, nhưng nó cũng hoan nghênh những điều đó ngay lập tức liên quan đến bản chất bên trong
                của bạn.                
                </p>
                <p>
                Số Nhân cách của bạn cũng cho biết người khác nhìn nhận bạn như thế nào. Không ai có thể
                khách quan về bản thân mình. Ngay cả những người bạn thân nhất và người thân của chúng ta
                cũng gặp khó khăn khi mô tả cách họ nhìn thấy chúng ta.
                </p>
                <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_67.png">
                        <div class="value">${content[6].number}</div> 
                </div>
                ${content[6].content}
                </div>
                <div>
                <h2 style="text-align: center;">CẦU NỐI KHÁT TÂM/NHÂN CÁCH</h2>
                <p>
                Chúng ta có định kiến nhất định về bản thân và về những người xung quanh. Chúng ta hiếm khi
                nghĩ rằng hình ảnh của chúng ta về mọi người khác với nhận thức của họ về chính họ - cách họ
                nhìn nhận và hành xử.
                </p>
                <p>
                Bạn có bao giờ tự hỏi tại sao một sự việc, hành động nhưng bạn và những người khác lại có
                cách phản ứng khác nhau không? Câu trả lời là trong cầu nối Khát tâm/Nhân cách. Nó cho thấy sự
                thật ở giữa. Đây là một cây cầu kết nối quan điểm của bạn về bản thân và hình ảnh phản chiếu của
                bạn trong mắt người khác.
                </p>
                <h2 style="text-align: center;">Số cầu nối: ${
									content[7].number
								}</h2>
                ${content[7].content}
                </div>
                <div>
                <h2 style="text-align: center;">ĐAM MÊ TIỀM ẨN</h2>
                <p>
                Niềm đam mê tiềm ẩn của bạn cho thấy một hoặc nhiều sức mạnh và tài năng đặc biệt mà bạn
                dựa vào và có sẵn cho bạn. Đam mê tiềm ẩn đại diện cho lĩnh vực chuyên môn cụ thể của bạn,
                hoặc một tài năng tập trung.
                </p>
                <p>
                Nói một cách ẩn dụ, tài năng này có thể được coi là có một sức mạnh riêng để định hình cuộc
                sống của bạn. Sự tồn tại của nó mang đến cho bạn một khát vọng mạnh mẽ để phát triển và thể
                hiện khả năng đặc biệt đó. Tài năng đòi hỏi bạn thể hiện nó, rằng bạn trải nghiệm phần này của
                bạn, và bạn sống theo bản chất của nó. Theo cách này, đam mêm tiềm ẩn định hình tính cách và
                định hướng cuộc sống của bạn.
                </p>
                <h2 style="text-align: center;">Đam mê tiềm ẩn: ${
									content[8].number
								}</h2>
                ${content[8].content}
                </div>
                <div>
                <h2 style="text-align: center;">BÀI HỌC CUỘC SỐNG</h2>
                <p>
                Thần số học dựa trên sự hiểu biết rằng chúng ta bước vào cuộc sống với những điểm mạnh và
                điểm yếu nhất định. “Bài học cuộc đời” là những lĩnh vực mà chúng ta hiện đang yếu và phải đối
                mặt và làm việc trong cuộc sống này. Có thể có nhiều hơn một bài học cuộc sống.
                </p>
                <p>
                Số thiếu, những số không được thể hiện trong các chữ cái trong tên của bạn, ngụ ý các công cụ
                không có sẵn, và phải được học và thành thạo trong suốt cuộc đời này.                
                </p>
                <p>
                Bạn hãy coi các “Bài học cuộc đời” là những điểm yếu của mình và bạn phải học để hoàn thiện
                bản thân, nó là những thách thức sẽ thỉnh thoảng xuất hiện trong suốt cuộc đời bạn.                
                </p>
                <p>
                Ảnh hưởng của bài học cuộc đời sẽ giảm đi nếu bạn có ít nhất một số 1 trong số các số cốt lõi
                của mình (Đường đời, ngày sinh, sứ mệnh, khát tâm, nhân cách).
                </p>
                <h2 style="text-align: center;">Bài học ${
									content[9].number
								}</h2>
                ${content[9].content}
                </div>
                <div>
                <h2 style="text-align: center;">TIỀM THỨC ẨN</h2>
                <p>
                Hầu hết mọi người trong cuộc sống này phải đối mặt với những trở ngại theo thời gian. Mặc
                dù chúng ta biết những bước chúng ta cần phải thực hiện, chúng ta thường không đối phó với
                chúng về mặt cảm xúc. Rất nhiều người tự trách mình vì những vấn đề xảy ra trong cuộc sống của
                họ, và phản ứng cảm xúc mạnh mẽ đến mức bản thân vấn đề dường như không quá lớn. Tuy
                nhiên, hầu hết chúng ta quên mất những điểm mạnh và lợi thế có thể và phải được sử dụng trong
                những tình huống chúng ta cần bảo vệ bản thân hoặc chứng minh ai đó sai. Số tiềm thức ẩn của
                bạn là để giúp bạn nhấn mạnh những đặc điểm đó trong bạn, đó là chìa khóa để vượt qua những
                trở ngại. Những đặc điểm này đôi khi sẽ giúp bạn giải quyết chỉ một phần của vấn đề, đôi khi giúp
                bạn bình tĩnh vượt qua mọi thứ và đôi khi là công cụ chính của bạn để thoát khỏi rắc rối. Con số
                này cho thấy các đặc điểm mà bạn cần phát triển để phản ứng với những rắc rối bất ngờ dưới bất
                kỳ hình thức nào.
                </p>
                <h2 style="text-align: center;">Tiềm thức ẩn ${
									content[10].number
								}</h2>
                ${content[10].content}
                </div>
                <div>
                <h2 style="text-align: center;">SỐ SUY NGHĨ HỢP LÝ</h2>
                <p>
                Đây là một con số đặc biệt phản ánh phong cách suy nghĩ và các kiểu ra quyết định của bạn.
                Tất nhiên, nó không phải là một trong những con số cho thấy đường đời hay tiềm thức của bạn
                nhưng nó cho thấy cơ chế của quá trình suy nghĩ của bạn. Về cơ bản, nó nói rất nhiều về khả năng
                hành động của bạn trong các tình huống căng thẳng. Nó cho thấy chất lượng của các giải pháp
                bạn tìm thấy và các xu hướng lựa chọn của bạn.
                </p>
                <p>
                Nhiều người không thể nói chắc chắn họ có phong cách suy nghĩ nào vì rất khó để ước tính
                chính xác bản thân. Bài đọc này sẽ giúp bạn hiểu nhóm các tư tưởng mà bạn thuộc về. Ngoài ra,
                nếu bạn có thể biết được số suy nghĩ hợp lý của các đối tác bạn có thể xây dựng các chiến lược
                giao tiếp dựa trên phong cách suy nghĩ của những người đó.
                </p>
                <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_69.png">
                        <div class="value">${content[11].number}</div> 
                </div>
                ${content[11].content}
                </div>
                <div>
                <h2 style="text-align: center;">SỐ CÂN BẰNG</h2>
                <p>
                Mỗi người đều có một phong cách ứng xử nhất định khi có điều gì đó tiêu cực xảy ra. Một số
                trở nên tuyệt vọng và nhượng bộ, và những người khác rơi vào một cơn thịnh nộ.
                </p>
                <p>
                Số cân bằng đến với chúng ta trong hoàn cảnh khó khăn. Nó chỉ cho chúng ta hành vi đúng
                đắn để giải quyết vấn đề dễ dàng nhất có thể và không làm tổn thương những người xung quanh
                chúng ta. Chúng ta thường mất kiểm soát và đưa ra quyết định cảm tính hoặc nói những lời dẫn
                đến hậu quả không mong muốn.
                </p>
                <p>
                Nếu bạn muốn tìm hiểu làm thế nào để tránh sự leo thang của vấn đề hoặc cách khắc phục tình
                huống khi nó đã xuất hiện, số cân bằng sẽ cung cấp cho bạn.                
                </p>
                <div class="number">
                        <img src="file:///${projectRoot}/public/img/vi_71.png">
                        <div class="value">${content[12].number}</div> 
                </div>
                ${content[12].content}
                </div>
                <div>
                <h2 style="text-align: center;">NỀN TẢNG</h2>
                <p>
                Chữ cái đầu tiên của tên đầy đủ của bạn khi sinh được gọi là Nền tảng. Nó cung
                cấp cho bạn một dấu hiệu của nhân vật của bạn, đặc biệt là trong cách bạn tiếp cận
                các cơ hội và trở ngại.
                </p>
                <p>
                Chữ cái cuối cùng của tên bạn cho thấy khả năng và thái độ của bạn đối với việc
                hoàn thành các dự án mà bạn bắt đầu.
                </p>
                <h2 style="text-align: center;">NỀN TẢNG: ${
									content[13].number
								}</h2>
                ${content[13].content}
                </div>
                <div>
                <h2 style="text-align: center;">4 MẶT PHẲNG BIỂU HIỆN</h2>
                <p>
                Mỗi người trải nghiệm cuộc sống ở bốn mặt phẳng khác nhau: cơ thể vật lý, tinh thần, cảm xúc
                và trực giác. Mỗi lĩnh vực này nhận thức và xử lý một loại thông tin cụ thể.
                </p>
                <p>
                Cơ thể vật lý có khả năng chạm, nếm, khoái cảm và đau đớn. Nó cung cấp cho chúng ta một
                cảm giác về thế giới vật chất. Tinh thần, cảm xúc và trực giác nhận thức về thế giới vô hình.
                </p>
                <p>
                Bốn yếu tố này tồn tại trong tất cả chúng ta nhưng mỗi người lại có một yếu tố chiếm ưu thế.
                Nó được thể hiện thường xuyên hoặc mãnh liệt hơn các yếu tố khác.
                </p>
                <p>
                Mặt phẳng vật lý phản ánh cách chúng ta xử lý sức mạnh của mình
                </p>
                <p>
                Mặt phẳng tinh thần phản ánh loại suy nghĩ nào chúng ta có và cách chúng ta lên kế hoạch hành
                động kỹ lưỡng.
                </p>
                <p>
                Mặt phẳng cảm xúc thể hiện hình ảnh tình cảm của bạn.
                </p>
                <p>
                Mặt phẳng trực giác cho thấy thế giới nội tâm của bạn, nguồn cảm hứng và mức độ cân bằng
                của bạn. Đó là một chỉ số liên quan tới tâm linh của bạn. Trực giác cho bạn cái nhìn về thế giới
                trong nháy mắt, không thông qua lý trí.                
                </p>
                </div>
                <div>
                <h2 style="text-align: center;">THỂ CHẤT ${
									content[14].number
								}</h2>
                ${content[14].content}
                <h2 style="text-align: center;">TINH THẦN ${
									content[15].number
								}</h2>
                ${content[15].content}
                <h2 style="text-align: center;">CẢM XÚC ${
									content[16].number
								}</h2>
                ${content[16].content}
                <h2 style="text-align: center;">TRỰC GIÁC ${
									content[17].number
								}</h2>
                ${content[17].content}
                </div>
                <div>
                <h2>Phần III: VẬN TRÌNH CUỘC ĐỜI</h2>
                </div>
                <div>
                <h2 style="text-align: center;">CHU KỲ CUỘC SỐNG</h2>
                <p>
                Giống như hầu hết các câu chuyện, có ba phần trong cuộc sống của chúng ta:
                </p>
                <p>
                Chu kỳ đầu tiên hoặc giai đoạn mở đầu: Chúng ta mò mẫm đi tìm bản chất thực sự của chúng
                ta. Đồng thời, chúng ta đang cố gắng đối phó với các nhân tố tác động mạnh mẽ có mặt trong môi
                trường sống của chúng ta. Ví dụ: cha mẹ và các điều kiện kinh tế xã hội của gia đình chúng ta…
                </p>
                <p>
                Chu kỳ thứ hai - giai đoạn giữa của cuộc đời, mang đến sự xuất hiện dần dần của tài năng cá
                nhân và sáng tạo của chúng ta. Phần đầu của chu kỳ này: 30 - 35 tuổi đại diện cho một cuộc đấu
                tranh để tìm vị trí của chúng ta trên thế giới này, trong khi những năm cuối tuổi 30, 40 và đầu
                tuổi 50: chúng ta nhìn thấy mức độ tự làm chủ và ảnh hưởng lớn hơn tới môi trường.
                </p>
                <p>
                Chu kỳ thứ ba - cuối cùng, đại diện cho sự nở hoa nội tâm của chúng ta, như vậy bản chất thực
                sự của chúng ta cuối cùng đã có kết quả. Chính trong chu kỳ này, người ta có mức độ thể hiện bản
                thân và sức ảnh hưởng lớn nhất.
                </p>                
                <div class="number" style="margin-top: 100px">
                        <img src="file:///${projectRoot}/public/img/Capture2.PNG">
                        <div class="value" style="left: -150px;">${
													content[18].number
												}</div>
                        <div class="value">${content[19].number}</div>
                        <div class="value" style="right: -150px;">${
													content[20].number
												}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center;">CHU KỲ 1: ${
									content[18].number
								}</h2>
                ${content[18].content}
                <h2 style="text-align: center;">CHU KỲ 2: ${
									content[19].number
								}</h2>
                ${content[19].content}
                <h2 style="text-align: center;">CHU KỲ 3: ${
									content[20].number
								}</h2>
                ${content[20].content}
                </div>
                <div>
                <h2 style="text-align: center;">4 CHU KỲ ĐỈNH CAO</h2>
                <p>
                “Đỉnh cao” là bốn chu kỳ dài hạn trên Đường đời của bạn. Mỗi “Đỉnh cao”đại diện cho một bài
                học cụ thể mà bạn đang làm.
                </p>
                <p>
                Các “Đỉnh cao” rất quan trọng. Sự chuyển đổi từ một “Đỉnh cao” sang “Đỉnh cao” kế tiếp bạn có
                thể cảm nhận thấy rất rõ ràng. “Đỉnh cao” của bạn tiết lộ các điều kiện và sự kiện chung mà bạn sẽ
                trải qua trong thời gian đó. “Đỉnh cao” mô tả môi trường hoặc thách thức thiết yếu mà bạn sẽ
                phải đối mặt. Bạn có thể chuẩn bị cho thời gian phía trước bằng cách biết số “Đỉnh cao” sắp tới
                của mình.
                </p>
                <p>
                Việc chuyển đổi từ một “Đỉnh cao” sang kế tiếp thường được chuẩn bị trước khoảng 2 năm. Đó
                là 2 năm đặc biệt và thay đổi mạnh mẽ. Bạn có thể sẽ đưa ra một số quyết định thay đổi cuộc
                sống - hôn nhân, công việc, sự nghiệp hoặc thay đổi lớn trong tính cách của bạn.
                </p>
                <p>
                Có lẽ sự thay đổi mạnh mẽ nhất - bên trong cũng như bên ngoài - là sự chuyển đổi từ Đỉnh cao
                thứ nhất sang Đỉnh cao thứ hai. Bạn bắt đầu cảm thấy tác động của sự thay đổi sắp tới này
                khoảng hai năm trước. Đây thường là một quá trình chuyển đổi khó khăn, nhưng một khi đã vượt
                qua thường mang lại cảm giác rõ ràng về phương hướng trong cuộc sống của một người. Nó cũng
                cung cấp cho bạn một cảm giác vững chắc hơn nhiều về bản sắc của bạn. Đó là một cửa ngõ cho
                sự trưởng thành.                
                </p>
                <div class="number">
                        <img src="file:///${projectRoot}/public/img/Capture3.PNG">
                        <div class="value" style="left: -100px; top: 240px;">${
													content[21].number
												}</div>
                        <div class="value" style="left: 100px; top: 240px;">${
													content[22].number
												}</div>
                        <div class="value" style="top: 210px;">${
													content[23].number
												}</div>
                        <div class="value">${content[24].number}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center;">ĐỈNH CAO 1: ${
									content[21].number
								}</h2>
                ${content[21].content}
                <h2 style="text-align: center;">ĐỈNH CAO 2: ${
									content[22].number
								}</h2>
                ${content[22].content}
                <h2 style="text-align: center;">ĐỈNH CAO 3: ${
									content[23].number
								}</h2>
                ${content[23].content}
                <h2 style="text-align: center;">ĐỈNH CAO 4: ${
									content[24].number
								}</h2>
                ${content[24].content}
                </div>
                <div>
                <h2 style="text-align: center;">4 THÁCH THỨC</h2>
                <p>
                Mỗi chúng ta sinh ra đều có cả điểm mạnh và điểm yếu. Thần số học nhìn cuộc
                sống như thể đó là một quá trình giáo dục nhằm phát huy và nâng cao tài năng của
                chúng ta, biến điểm yếu thành điểm mạnh. Điều này nhằm giúp hoàn thiện bản thể
                của chúng ta.
                </p>
                <p>
                Công việc trở nên toàn vẹn là trong đó chúng ta phải đối mặt với những điểm yếu
                của bản thân và có ý thức rèn luyện để hoàn thiện nó. Có 4 Thách thức chúng ta phải
                đối mặt trong cuộc sống. Nhiều người trong chúng ta sẽ gặp lại cùng một thách
                thức nhiều lần, trong khi những người khác có 4 thách thức khác nhau để học.
                </p>
                <p>
                Những Thách thức trên Đường đời của bạn cung cấp những bài học cụ thể mà
                bạn phải tham gia để truyền cảm hứng và giúp bạn, cuộc sống sẽ đặt bạn vào những
                tình huống đòi hỏi những đặc điểm cụ thể của những con số Thách thức của riêng
                bạn.
                </p>
                <p>
                4 Thách thức bạn cần phải vượt qua trong suốt cuộc đời này sẽ ảnh hưởng đến
                bạn trong các giai đoạn khác nhau của cuộc đời.
                </p>
                <p>
                Tất cả Thách thức của bạn là có sẵn trong ngày bạn sinh ra.
                </p>
                <div class="number" style="margin-top: 50px;">
                        <img src="file:///${projectRoot}/public/img/Capture4.PNG">
                        <div class="value" style="left: -80px; top: 8px;">${
													content[25].number
												}</div>
                        <div class="value" style="left: 80px; top: 8px;">${
													content[26].number
												}</div>
                        <div class="value" style="top: 30px;">${
													content[27].number
												}</div>
                        <div class="value" style="top: 140px;">${
													content[28].number
												}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center;">THÁCH THỨC 1: ${
									content[25].number
								}</h2>
                ${content[25].content}
                </div>
                <div>
                <h2 style="text-align: center;">THÁCH THỨC 2: ${
									content[26].number
								}</h2>
                ${content[26].content}
                </div>
                <div>
                <h2 style="text-align: center;">THÁCH THỨC 3: ${
									content[27].number
								}</h2>
                ${content[27].content}
                </div>
                <div>
                <h2 style="text-align: center;">THÁCH THỨC 4: ${
									content[28].number
								}</h2>
                ${content[28].content}
                </div>
                <div>
                <h2 style="text-align: center;">NĂM CÁ NHÂN</h2>
                <p>
                Số “Năm cá nhân” của bạn là một dấu hiệu mạnh mẽ về các xu hướng và hoàn cảnh bạn sẽ trải
                qua trong một năm. Chu kỳ “Năm cá nhân” của bạn dựa trên chu kỳ Năm Quốc tế và do đó chạy
                đồng bộ với năm dương lịch.                
                </p>
                <p>
                Có 9 “Năm cá nhân” tạo nên một vòng tròn hoàn chỉnh.
                </p>
                <p>
                Mỗi một vòng cho thấy sự tiến triển hay sự tiến hóa một phần cụ thể trong sự tăng trưởng
                của bạn. Sự tiến bộ của bạn có thể được nhìn thấy rất logic, từ giai đoạn trứng nước hoặc bắt đầu
                một giai đoạn tăng trưởng trong cuộc đời bạn, cho đến khi kết thúc của quá trình đó. “Năm cá
                nhân” số 1 chỉ ra những bước đầu tiên của bạn theo một hướng mới. Những năm tiếp theo cho
                thấy sự tiến bộ của bạn trên con đường này, kết thúc 9 “Năm cá nhân” của bạn, hoàn thành một
                chu kỳ. Dưới đây là một mô tả về “Năm cá nhân” hiện tại của bạn và 2 năm tiếp theo. Nó cho biết
                bạn đang ở đâu trên chiếc xe 9 năm.
                </p>
                <p>
                Năm cá nhân hình thành các bước xây dựng và đánh dấu sự tiến bộ của bạn trong suốt cuộc
                đời.                
                </p>
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN 2021: ${
											content[29].number
										}</h2>
                    ${content[29].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN 2022: ${
											content[30].number
										}</h2>
                    ${content[30].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN 2023: ${
											content[31].number
										}</h2>
                    ${content[31].content}
                </div>   
    </body>
</html>

    `,
			options
		)
		.toBuffer(async (err, buffer) => {
			pdfmain = buffer;
			if (pdfmain && pdfcover) {
				const merged = await merge([pdfcover, pdfmain]);
				const report = new Report({
					name: req.body.name,
					sex: req.body.sex,
					birthday: req.body.birthday,
					userId: req.user.id,
					content: merged,
				});
				try {
					const savedReport = await report.save();
					res.send('Thành công');
				} catch (err) {
					res.status(400).send(err);
				}
			}
		});

	pdf
		.create(
			`
        <html style="zoom: 1.0;">
            <body style="margin: 0;">
                <div id="bia" style="position: relative; padding: 0;">
                    <img style="width:8.27in;height:11.69in;" src="file:///${projectRoot}/public/img/cover.png">
                    <div style="position: absolute; bottom: 1.3in; width: 100%;text-align: center;"><span style="font-size:24pt;color:#fff;text-transform: uppercase;">${name} ${birthday}</span></div>
                </div>
            </body>
        </html>
        `
		)
		.toBuffer(async (err, buffer) => {
			pdfcover = buffer;
			if (pdfmain && pdfcover) {
				const merged = await merge([pdfcover, pdfmain]);
				const report = new Report({
					name: req.body.name,
					sex: req.body.sex,
					birthday: req.body.birthday,
					userId: req.user.id,
					content: merged,
				});
				try {
					const savedReport = await report.save();
					res.send('Thành công');
				} catch (err) {
					res.status(400).send(err);
				}
			}
		});
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
	let data;

	try {
		if (isAdmin) {
			if (field && keyword) {
				if (field == 'name') {
					data = await Report.find({ name: { $regex: keyword } }, null, {
						skip,
						limit,
					});
					countDocs = await Report.countDocuments({
						name: { $regex: keyword },
					});
				} else if (field == 'birthday') {
					let birthday = new Date(keyword);
					data = await Report.find(
						{
							birthday: {
								$gte: keyword,
								$lt: new Date(birthday.getTime() + 86400000),
							},
						},
						null,
						{ skip, limit }
					);
				} else {
					data = await Report.find({ [field]: keyword }, null, { skip, limit });
					countDocs = await Report.countDocuments({ [field]: keyword });
				}
			} else {
				data = await Report.find(null, null, { skip, limit });
				countDocs = await Report.countDocuments();
			}
		} else {
			if (field && keyword) {
				if (field == 'name') {
					data = await Report.find(
						{ userId: req.user.id, name: { $regex: keyword } },
						null,
						{ skip, limit }
					);
					countDocs = await Report.countDocuments({
						userId: req.user.id,
						name: { $regex: keyword },
					});
				} else if (field == 'birthday') {
					let birthday = new Date(keyword);
					data = await Report.find(
						{
							userId: req.user.id,
							birthday: {
								$gte: keyword,
								$lt: new Date(birthday.getTime() + 86400000),
							},
						},
						null,
						{ skip, limit }
					);
				} else {
					data = await Report.find(
						{ userId: req.user.id, [field]: keyword },
						null,
						{ skip, limit }
					);
					countDocs = await Report.countDocuments({
						userId: req.user.id,
						[field]: keyword,
					});
				}
			} else {
				data = await Report.find({ userId: req.user.id }, null, {
					skip,
					limit,
				});
				countDocs = await Report.countDocuments({ userId: req.user.id });
			}
		}

		let finalData = [];
		data.map((item) => {
			finalData.push({
				_id: item._id,
				name: item.name,
				sex: item.sex,
				birthday: item.birthday,
				date: item.date,
			});
		});

		reports.data = finalData;
		reports.countPages = Math.ceil(countDocs / limit);
		res.status(200).send(reports);
	} catch (err) {
		res.status(404).send(err);
	}
});

router.delete('/', (req, res) => {
	const { _id } = req.body;
	Report.findOneAndDelete({ _id })
		.then((item) => res.status(200).json(item))
		.catch((err) => res.status(404).json(err));
});

router.get('/statistic', authentication, async (req, res) => {
	const { isAdmin } = await User.findById(req.user.id);

	Report.aggregate(
		[
			{
				$match: isAdmin ? {} : { userId: req.user.id },
			},
			{
				$project: {
					year: { $year: '$date' },
					month: { $month: '$date' },
				},
			},
			{
				$group: {
					_id: {
						month: '$month',
						year: '$year',
					},
					total: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					month: '$_id.month',
					year: '$_id.year',
					total: '$total',
				},
			},
		],
		function (err, result) {
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
		}
	);
});

router.get('/:id', async (req, res) => {
	const reportId = req.params.id;
	const data = await Report.findById(reportId);

	res.set('Content-Type', 'application/pdf');
	res.end(data.content, 'binary');
});

function nameToNumber(str) {
	str = str.toLocaleUpperCase();
	str = removeVietnameseTones(str);
	let arr = [];
	let numb;
	for (let i = 0; i < str.length; i++) {
		numb = str.charCodeAt(i) - 64;
		if (numb > 9 && numb < 19) arr.push(numb - 9);
		if (numb >= 19) arr.push(numb - 18);
		if (numb > 0 && numb <= 9) arr.push(numb);
	}
	return arr;
}

function nameToNumberHtml(str) {
	str = str.toLocaleUpperCase();
	str = removeVietnameseTones(str);
	let arr = [];
	let numb;
	for (let i = 0; i < str.length; i++) {
		numb = str.charCodeAt(i) - 64;
		if (numb > 9 && numb < 19) numb = numb - 9;
		if (numb >= 19) numb = numb - 18;
		if (numb < 0) numb = 0;

		if (numb === 0) arr.push('<div class="space"></div>');
		else
			arr.push(
				`<div><div>${str[i]}</div><div style="background-color: ${getColor(
					numb
				)};">${numb}</div></div>`
			);
	}

	return arr.join('');
}

function getColor(number) {
	switch (number) {
		case 1:
			return '#FF0000';
		case 2:
			return '#F17E0B';
		case 3:
			return '#FFFF00';
		case 4:
			return '#9FD319';
		case 5:
			return '#00B0F0';
		case 6:
			return '#0070C0';
		case 7:
			return '#AD5AC4';
		case 8:
			return '#EB567E';
		case 9:
			return '#109611';
	}
}

function removeVietnameseTones(str) {
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
	str = str.replace(/đ/g, 'd');
	str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
	str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
	str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
	str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
	str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
	str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
	str = str.replace(/Đ/g, 'D');
	// Some system encode vietnamese combining accent as individual utf-8 characters
	// Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
	str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
	str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
	// Remove extra spaces
	// Bỏ các khoảng trắng liền nhau
	str = str.replace(/ + /g, ' ');
	str = str.trim();
	// Remove punctuations
	// Bỏ dấu câu, kí tự đặc biệt
	str = str.replace(
		/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
		' '
	);
	return str;
}

module.exports = router;
