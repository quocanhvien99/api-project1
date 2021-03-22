const router = require('express').Router();
var pdf = require('html-pdf');
const { merge } = require('merge-pdf-buffers');
const authentication = require('../authentication');
const Report = require('../models/Report');
const User = require('../models/User');
const Content = require('../models/Content');
const dictKey = require('../dictKey');
const congthuc = require('../congthuc');

const { reportValidation } = require('../validation');

router.post('/', authentication, async (req, res) => {
	//Validate data
	const { error } = reportValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let result = congthuc(req.body.name, req.body.birthday);

	let content = await Promise.all([
		Content.findOne({
			key: dictKey[0].key,
			number: result.duongdoi.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[1].key,
			number: result.sumenh.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[3].key,
			number: result.caunoi.duongdoisumenh,
		}),
		Content.findOne({ key: dictKey[4].key, number: result.ngaysinh }),
		Content.findOne({
			key: dictKey[5].key,
			number: result.khattam.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[6].key,
			number: result.nhancach.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[7].key,
			number: result.caunoi.khattamnhancach,
		}),
		Content.findOne({
			key: dictKey[11].key,
			number: result.suynghihoply.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[12].key,
			number: result.canbang.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[18].key,
			number: result.chukycuocsong[0].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[18].key,
			number: result.chukycuocsong[1].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[18].key,
			number: result.chukycuocsong[2].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[21].key,
			number: result.chukydinhcao[0].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[21].key,
			number: result.chukydinhcao[1].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[21].key,
			number: result.chukydinhcao[2].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[21].key,
			number: result.chukydinhcao[3].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[25].key,
			number: result.chukythachthuc[0].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[25].key,
			number: result.chukythachthuc[1].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[25].key,
			number: result.chukythachthuc[2].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[25].key,
			number: result.chukythachthuc[3].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[29].key,
			number: result.namcanhan[0].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[29].key,
			number: result.namcanhan[1].number.slice(-1)[0],
		}),
		Content.findOne({
			key: dictKey[29].key,
			number: result.namcanhan[2].number.slice(-1)[0],
		}),
	]);

	// let checkMainNumber = async (x, key) => {
	// 	const beforeLast = x.slice(-2)[0];
	// 	if (beforeLast == 11 || beforeLast == 22 || beforeLast == 33) {
	// 		let data = await Content.findOne({
	// 			key: key,
	// 			number: beforeLast,
	// 		});
	// 		return data.content;
	// 	}
	// 	return false;
	// };

	// let checkHopLy = await checkMainNumber(result.suynghihoply, 11);

	let extendContent = async (x) => {
		const beforeLast = result[x].slice(-2)[0];
		if (
			beforeLast == 13 ||
			beforeLast == 14 ||
			beforeLast == 16 ||
			beforeLast == 19
		) {
			let data = await Content.findOne({
				key: dictKey[0].key,
				number: beforeLast,
			});
			return data.content;
		}
		return '';
	};

	let extendduongdoi = await extendContent('duongdoi');

	let damme = [];
	for (let i = 0; i < result.dammebaihoctiemthuc.damme.length; i++) {
		damme.push(
			await Content.findOne({
				key: dictKey[8].key,
				number: result.dammebaihoctiemthuc.damme[i],
			})
		);
	}
	damme = damme.map(
		(x) => `<h2 style="text-align: center;">Đam mê tiềm ẩn: ${x.number}</h2>
    ${x.content}`
	);
	damme = damme.join('');

	let baihoc = [];
	for (let i = 0; i < result.dammebaihoctiemthuc.baihoc.length; i++) {
		baihoc.push(
			await Content.findOne({
				key: dictKey[9].key,
				number: result.dammebaihoctiemthuc.baihoc[i],
			})
		);
	}
	baihoc = baihoc.map(
		(x) => `<h2 style="text-align: center;">Bài học: ${x.number}</h2>
    ${x.content}`
	);
	baihoc = baihoc.join('');

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
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,400&display=swap');
            html{zoom: ${process.env.SERVER_OS == 'linux' ? 0.75 : 1.0};}
            body {
                margin: 0;
                font-family: 'Roboto';
            }
            body *:not(h2, .number) {
                font-size: 12pt
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
                font-weight: normal;
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
                    <p style="margin: 0.4in 0; font-weight: bold;">I. LA BÀN ĐỊNH VỊ CUỘC ĐỜI</p>
                    <p>• Số đường đời</p>
                    <p>• Số sứ mệnh</p>
                    <p>• Số cầu nối</p>
                    <p style="margin: 0.4in 0; font-weight: bold;">II. HÀNH TRANG VÀO ĐỜI</p>
                    <p>• Số ngày sinh</p>
                    <p>• Số khát tâm</p>
                    <p>• Số nhân cách</p>
                    <p>• Đam mê tiềm ẩn</p>
                    <p>• Số suy nghĩ hợp lý</p>
                    <p>• Số cân bằng</p>
                    <p style="margin: 0.4in 0; font-weight: bold;">III. CHU KỲ CUỘC SỐNG – ĐỈNH CAO & THÁCH THỨC</p>
                    <p>• 3 Chu kỳ sống</p>
                    <p>• 4 đỉnh cao</p>
                    <p>• 4 thách thức</p>
                    <p>• Năm cá nhân</p>
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
                        <img src="file:///${projectRoot}/public/img/duongdoi/${
				content[0].number
			}.png">
                    </div>
                    ${content[0].content}
                    ${extendduongdoi}
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
                        <img src="file:///${projectRoot}/public/img/sumenh/${
				content[1].number
			}.png">
                    </div>
                    ${content[1].content}
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
											content[2].number
										}</h2>
                    ${content[2].content}
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
									content[3].number
								}</h2>
                ${content[3].content}
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
                        <img src="file:///${projectRoot}/public/img/khattam/${
				content[4].number
			}.png">
                </div>
                ${content[4].content}
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
                        <img src="file:///${projectRoot}/public/img/nhancach/${
				content[5].number
			}.png">
                </div>
                ${content[5].content}
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
									content[6].number
								}</h2>
                ${content[6].content}
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
                ${damme}
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
                ${baihoc}
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
                        <img src="file:///${projectRoot}/public/img/hoply/${
				content[7].number
			}.png">
                </div>
                ${content[7].content}
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
                        <img src="file:///${projectRoot}/public/img/canbang/${
				content[8].number
			}.png">
                </div>
                ${content[8].content}
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
                        <img src="file:///${projectRoot}/public/img/chuky/img.PNG">
                        <div class="value" style="left: -150px;">${
													content[9].number
												}</div>
                        <div class="value">${content[10].number}</div>
                        <div class="value" style="right: -150px;">${
													content[11].number
												}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center;">CHU KỲ 1 (${
									result.chukycuocsong[0].start
								} - ${result.chukycuocsong[0].end}): ${content[9].number}</h2>
                ${content[9].content}
                <h2 style="text-align: center;">CHU KỲ 2 (${
									result.chukycuocsong[1].start
								} - ${result.chukycuocsong[1].end}): ${content[10].number}</h2>
                ${content[10].content}
                <h2 style="text-align: center;">CHU KỲ 3 (${
									result.chukycuocsong[2].start
								} - ${result.chukycuocsong[2].end}): ${content[11].number}</h2>
                ${content[11].content}
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
                        <img src="file:///${projectRoot}/public/img/dinhcao/img.PNG">
                        <div class="value" style="left: -100px; top: 240px;">${
													content[12].number
												}</div>
                        <div class="value" style="left: 100px; top: 240px;">${
													content[13].number
												}</div>
                        <div class="value" style="top: 210px;">${
													content[14].number
												}</div>
                        <div class="value">${content[15].number}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center; margin-bottom:0.05in">ĐỈNH CAO 1: ${
									content[12].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt; margin-top:0in">${
									result.chukydinhcao[0].start
								} - ${result.chukydinhcao[0].end}</h2>
                ${content[12].content}
                <h2 style="text-align: center; margin-bottom:0.05in">ĐỈNH CAO 2: ${
									content[13].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt; margin-top:0in">${
									result.chukydinhcao[1].start
								} - ${result.chukydinhcao[1].end}</h2>
                ${content[13].content}
                <h2 style="text-align: center; margin-bottom:0.05in">ĐỈNH CAO 3: ${
									content[14].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt; margin-top:0in">${
									result.chukydinhcao[2].start
								} - ${result.chukydinhcao[2].end}</h2>                
                ${content[14].content}
                <h2 style="text-align: center; margin-bottom:0.05in">ĐỈNH CAO 4: ${
									content[15].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt; margin-top:0in">${
									result.chukydinhcao[3].start
								} - ${result.chukydinhcao[3].end}</h2>                
                ${content[15].content}
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
                        <img src="file:///${projectRoot}/public/img/thachthuc/img.PNG">
                        <div class="value" style="left: -80px; top: 4px;">${
													content[16].number
												}</div>
                        <div class="value" style="left: 80px; top: 4px;">${
													content[17].number
												}</div>
                        <div class="value" style="top: 30px;">${
													content[18].number
												}</div>
                        <div class="value" style="top: 140px;">${
													content[19].number
												}</div>
                </div>
                </div>
                <div>
                <h2 style="text-align: center; margin-bottom:0.05in">THÁCH THỨC 1: ${
									content[16].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt;">0 - 30/35 tuổi</h2>
                ${content[16].content}
                </div>
                <div>
                <h2 style="text-align: center; margin-bottom:0.05in">THÁCH THỨC 2: ${
									content[17].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt;">30/35 tuổi - 55/60 tuổi</h2>
                ${content[17].content}
                </div>
                <div>
                <h2 style="text-align: center; margin-bottom:0.05in">THÁCH THỨC 3: ${
									content[18].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt;">trọn đời</h2>
                ${content[18].content}
                </div>
                <div>
                <h2 style="text-align: center; margin-bottom:0.05in">THÁCH THỨC 4: ${
									content[19].number
								}</h2>
                <h2 style="text-align: center; font-size:12pt;">55/60 tuổi – hết</h2>
                ${content[19].content}
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
                    <h2 style="text-align: center;">NĂM CÁ NHÂN ${
											result.namcanhan[0].year
										}: ${content[20].number}</h2>
                    ${content[20].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN ${
											result.namcanhan[1].year
										}: ${content[21].number}</h2>
                    ${content[21].content}
                </div>
                <div>
                    <h2 style="text-align: center;">NĂM CÁ NHÂN ${
											result.namcanhan[2].year
										}: ${content[22].number}</h2>
                    ${content[22].content}
                </div>
    </body>
</html>

    `,
			options
		)
		.toBuffer(async (err, buffer) => {
			pdfmain = buffer;
			if (pdfmain && pdfcover) {
				const result = await mergePageAndSave(pdfcover, pdfmain, req);
				res.status(result.code).send(result.message);
			}
		});

	pdf
		.create(
			`
        <html >
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;1,400&display=swap');
                </style>
            </head>
            <body style="margin: 0;">
                <div id="bia" style="position: relative; padding: 0;">
                    <img style="width:100%;height:auto;" src="file:///${projectRoot}/public/img/cover.png">
                    <div style="zoom: ${
											process.env.SERVER_OS == 'linux' ? 0.7 : 1.0
										};position: absolute; bottom: ${
				process.env.SERVER_OS == 'linux' ? '1.4in' : '1.3in'
			}; width: 100%;text-align: center;"><span style="font-family:'Roboto';font-size:24pt;color:#fff;text-transform: uppercase;">${name} ${birthday}</span></div>
                </div>
            </body>
        </html>
        `
		)
		.toBuffer(async (err, buffer) => {
			pdfcover = buffer;
			if (pdfmain && pdfcover) {
				const result = await mergePageAndSave(pdfcover, pdfmain, req);
				res.status(result.code).send(result.message);
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
					})
						.select('-content')
						.sort({ date: -1 });
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
					)
						.select('-content')
						.sort({ date: -1 });
				} else {
					data = await Report.find({ [field]: keyword }, null, {
						skip,
						limit,
					})
						.select('-content')
						.sort({ date: -1 });
					countDocs = await Report.countDocuments({ [field]: keyword });
				}
			} else {
				data = await Report.find(null, null, { skip, limit })
					.select('-content')
					.sort({
						date: -1,
					});
				countDocs = await Report.countDocuments();
			}
		} else {
			if (field && keyword) {
				if (field == 'name') {
					data = await Report.find(
						{ userId: req.user.id, name: { $regex: keyword } },
						null,
						{ skip, limit }
					)
						.select('-content')
						.sort({ date: -1 });
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
					)
						.select('-content')
						.sort({ date: -1 });
				} else {
					data = await Report.find(
						{ userId: req.user.id, [field]: keyword },
						null,
						{ skip, limit }
					)
						.select('-content')
						.sort({ date: -1 });
					countDocs = await Report.countDocuments({
						userId: req.user.id,
						[field]: keyword,
					});
				}
			} else {
				data = await Report.find({ userId: req.user.id }, null, {
					skip,
					limit,
				})
					.select('-content')
					.sort({ date: -1 });
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

async function mergePageAndSave(pdfcover, pdfmain, req) {
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
		return { message: 'Thành công.', code: 200 };
	} catch (err) {
		return { message: 'Không thành công', code: 400 };
	}
}

module.exports = router;
