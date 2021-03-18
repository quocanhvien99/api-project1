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
const formatDate = (birthday) => {
	birthday = new Date(birthday);
	const day = birthday.getDate();
	const month = birthday.getMonth() + 1;
	const year = birthday.getFullYear();
	return { day, month, year };
};
const numberToDigits = (num) => {
	const digits = num.toString().split('');
	return digits.map(Number);
};
const shortenNumber = (num) => {
	if (num == 22 || num == 11 || num == 33 || num < 10) return num;

	let numArr = numberToDigits(num);
	return shortenNumber(
		numArr.reduce((a, b) => {
			return a + b;
		})
	);
};
const shortenNumber1 = (num) => {
	if (num < 10) return num;

	let numArr = numberToDigits(num);
	return shortenNumber1(
		numArr.reduce((a, b) => {
			return a + b;
		})
	);
};
const tachten = (name) => {
	name = removeVietnameseTones(name).toLowerCase().split(' ');
	let ho = name[0];
	let tenchinh = name[name.length - 1];
	let tendem = name.slice(1, name.length - 1).join('');
	return { ho, tenchinh, tendem };
};
const demnguyenam = (str) => {
	let songuyenam = 0;
	for (let i = 0; i < str.length; i++) {
		if (
			str[i] == 'a' ||
			str[i] == 'e' ||
			str[i] == 'i' ||
			str[i] == 'o' ||
			str[i] == 'u'
		) {
			songuyenam += numberChar[str[i]];
		}
		if (str[i] == 'y') {
			if (
				str[i - 1] !== 'a' &&
				str[i - 1] !== 'e' &&
				str[i - 1] !== 'i' &&
				str[i - 1] !== 'o' &&
				str[i - 1] !== 'u' &&
				str[i + 1] !== 'a' &&
				str[i + 1] !== 'e' &&
				str[i + 1] !== 'i' &&
				str[i + 1] !== 'o' &&
				str[i + 1] !== 'u'
			) {
				songuyenam += numberChar[str[i]];
			}
		}
	}
	return songuyenam;
};
const demphuam = (str) => {
	let sophunam = 0;
	for (let i = 0; i < str.length; i++) {
		if (
			str[i] !== 'a' &&
			str[i] !== 'e' &&
			str[i] !== 'i' &&
			str[i] !== 'o' &&
			str[i] !== 'u' &&
			str[i] !== 'y'
		) {
			sophunam += numberChar[str[i]];
		}
		if (str[i] == 'y') {
			if (
				str[i - 1] == 'a' ||
				str[i - 1] == 'e' ||
				str[i - 1] == 'i' ||
				str[i - 1] == 'o' ||
				str[i - 1] == 'u' ||
				str[i + 1] == 'a' ||
				str[i + 1] == 'e' ||
				str[i + 1] == 'i' ||
				str[i + 1] == 'o' ||
				str[i + 1] == 'u'
			) {
				sophunam += numberChar[str[i]];
			}
		}
	}
	return sophunam;
};

const numberChar = {
	a: 1,
	b: 2,
	c: 3,
	d: 4,
	e: 5,
	f: 6,
	g: 7,
	h: 8,
	i: 9,
	j: 1,
	k: 2,
	l: 3,
	m: 4,
	n: 5,
	o: 6,
	p: 7,
	q: 8,
	r: 9,
	s: 1,
	t: 2,
	u: 3,
	v: 4,
	w: 5,
	x: 6,
	y: 7,
	z: 8,
};

const duongdoi = (date) => {
	//truyen vao date da format
	const day = shortenNumber(date.day);
	const month = shortenNumber(date.month);
	const year = shortenNumber(date.year);
	return shortenNumber(day + month + year);
};

const sumenh = (name) => {
	// Phai tach ten truoc khi truyen
	let tenchinh = name.tenchinh;
	let tendem = name.tendem;
	let ho = name.ho;

	let hoNumb = 0;
	let tenchinhNumb = 0;
	let tendemNumb = 0;

	for (let i = 0; i < ho.length; i++) {
		hoNumb += numberChar[ho[i]];
	}
	for (let i = 0; i < tenchinh.length; i++) {
		tenchinhNumb += numberChar[tenchinh[i]];
	}
	for (let i = 0; i < tendem.length; i++) {
		tendemNumb += numberChar[tendem[i]];
	}

	hoNumb = shortenNumber(hoNumb);
	tenchinhNumb = shortenNumber(tenchinhNumb);
	tendemNumb = shortenNumber(tendemNumb);

	return shortenNumber(hoNumb + tendemNumb + tenchinhNumb);
};

const khattam = (name) => {
	// Phai tach ten truoc khi truyen
	let tenchinh = name.tenchinh;
	let tendem = name.tendem;
	let ho = name.ho;

	let hoNumb = shortenNumber1(demnguyenam(ho));
	let tenchinhNumb = shortenNumber1(demnguyenam(tenchinh));
	let tendemNumb = shortenNumber1(demnguyenam(tendem));

	return shortenNumber1(hoNumb + tenchinhNumb + tendemNumb);
};

const nhancach = (name) => {
	// Phai tach ten truoc khi truyen
	let tenchinh = name.tenchinh;
	let tendem = name.tendem;
	let ho = name.ho;

	let hoNumb = shortenNumber1(demphuam(ho));
	let tenchinhNumb = shortenNumber1(demphuam(tenchinh));
	let tendemNumb = shortenNumber1(demphuam(tendem));

	return shortenNumber1(hoNumb + tenchinhNumb + tendemNumb);
};

// const truongthanh = (duongdoi, sumenh) => shortenNumber(duongdoi + sumenh);

const caunoi = (duongdoi, sumenh, khattam, nhancach) => {
	if (duongdoi == 11) duongdoi = 2;
	if (duongdoi == 22) duongdoi = 4;
	if (duongdoi == 33) duongdoi = 6;
	if (sumenh == 11) sumenh = 2;
	if (sumenh == 22) sumenh = 4;
	if (sumenh == 33) sumenh = 6;
	if (khattam == 11) khattam = 2;
	if (khattam == 22) khattam = 4;
	if (khattam == 33) khattam = 6;
	if (nhancach == 11) nhancach = 2;
	if (nhancach == 22) nhancach = 4;
	if (nhancach == 33) nhancach = 6;

	return {
		duongdoisumenh: Math.abs(duongdoi - sumenh),
		khattamnhancach: Math.abs(khattam - nhancach),
	};
};

const dammebaihoctiemthuc = (name) => {
	let freqNumb = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (let i = 0; i < name.length; i++) {
		freqNumb[numberChar[name[i]] - 1] += 1;
	}

	let damme = [];
	let baihoc = [];

	const maxVal = Math.max(...freqNumb);
	for (let i = 0; i < freqNumb.length; i++) {
		if (freqNumb[i] == maxVal) damme.push(i + 1);
		if (freqNumb[i] == 0) baihoc.push(i + 1);
	}

	let tiemthuc = 9 - baihoc.length;

	return { damme, baihoc, tiemthuc };
};

const suynghihoply = (name, date) => {
	// Phai tach ten truoc khi truyen
	//date sau khi da format
	let tenchinh = name.tenchinh;
	let tenchinhNumb = 0;
	for (let i = 0; i < tenchinh.length; i++) {
		tenchinhNumb += numberChar[tenchinh[i]];
	}
	tenchinhNumb = shortenNumber1(tenchinhNumb);

	const day = shortenNumber1(date.day);

	return shortenNumber1(tenchinhNumb + day);
};

const canbang = (name) => {
	// Phai tach ten truoc khi truyen

	return shortenNumber1(
		numberChar[name.ho[0]] +
			numberChar[name.tenchinh[0]] +
			numberChar[name.tendem[0]]
	);
};

const chukycuocsong = (date, duongdoi) => {
	//date sau khi da format
	let start1 = date.year;
	let end1 = duongdoi == 1 ? start1 + 27 : start1 + 36 - duongdoi;
	let start2 = end1 + 1;
	let end2 = end1 + 27;
	let start3 = end2 + 1;
	let end3 = 'hết';

	return [
		{
			number: shortenNumber1(date.month),
			start: start1,
			end: end1,
		},
		{
			number: shortenNumber1(date.day),
			start: start2,
			end: end2,
		},
		{
			number: shortenNumber1(date.year),
			start: start3,
			end: end3,
		},
	];
};

const chukydinhcao = (date, duongdoi) => {
	//date sau khi da format
	let numb1 = shortenNumber1(date.month + date.day);
	let start1 = date.year;
	let end1 = date.year + 36 - duongdoi;
	let numb2 = shortenNumber1(date.year + date.day);
	let start2 = end1 + 1;
	let end2 = end1 + 9;
	let numb3 = shortenNumber1(numb1 + numb2);
	let start3 = end2 + 1;
	let end3 = end2 + 9;
	let numb4 = shortenNumber1(date.month + date.year);
	let start4 = end3 + 1;
	let end4 = 'hết';

	return [
		{ number: numb1, start: start1, end: end1 },
		{ number: numb2, start: start2, end: end2 },
		{ number: numb3, start: start3, end: end3 },
		{ number: numb4, start: start4, end: end4 },
	];
};

const chukythachthuc = (date) => {
	//date sau khi da format

	let numb1 = shortenNumber1(
		Math.abs(shortenNumber1(date.month) - shortenNumber1(date.day))
	);
	let start1 = '0';
	let end1 = '30/35 tuổi';
	let numb2 = shortenNumber1(
		Math.abs(shortenNumber1(date.year) - shortenNumber1(date.day))
	);
	let start2 = '30/35 tuổi';
	let end2 = '55/60 tuổi';
	let numb3 = shortenNumber1(Math.abs(numb1 - numb2));
	let start3 = 'Trọn đời';
	let end3 = 'Trọn đời';
	let numb4 = shortenNumber1(
		Math.abs(shortenNumber1(date.month) - shortenNumber1(date.year))
	);
	let start4 = '55/60';
	let end4 = 'hết';

	return [
		{ number: numb1, start: start1, end: end1 },
		{ number: numb2, start: start2, end: end2 },
		{ number: numb3, start: start3, end: end3 },
		{ number: numb4, start: start4, end: end4 },
	];
};

const namcanhan = (date) => {
	//date sau khi da format

	thisYear = new Date(Date.now()).getFullYear();
	return [
		{
			year: thisYear,
			number: shortenNumber1(
				shortenNumber1(date.day) +
					shortenNumber1(date.month) +
					shortenNumber1(thisYear)
			),
		},
		{
			year: thisYear + 1,
			number: shortenNumber1(
				shortenNumber1(date.day) +
					shortenNumber1(date.month) +
					shortenNumber1(thisYear + 1)
			),
		},
		{
			year: thisYear + 2,
			number: shortenNumber1(
				shortenNumber1(date.day) +
					shortenNumber1(date.month) +
					shortenNumber1(thisYear + 2)
			),
		},
	];
};

module.exports = (name, date) => {
	date = formatDate(date);
	name = tachten(name);

	const soduongdoi = duongdoi(date);
	const sosumenh = sumenh(name);
	const sokhattam = khattam(name);
	const sonhancach = nhancach(name);
	const socaunoi = caunoi(soduongdoi, sosumenh, sokhattam, sonhancach);
	const sodammebaihoctiemthuc = dammebaihoctiemthuc(
		name.ho + name.tenchinh + name.tendem
	);
	const sosuynghihoply = suynghihoply(name, date);
	const socanbang = canbang(name);
	const sochukycuocsong = chukycuocsong(date, soduongdoi);
	const sochukydinhcao = chukydinhcao(date, soduongdoi);
	const sochukythachthuc = chukythachthuc(date);
	const sonamcanhan = namcanhan(date);

	return {
		duongdoi: soduongdoi,
		sumenh: sosumenh,
		khattam: sokhattam,
		nhancach: sonhancach,
		caunoi: socaunoi,
		ngaysinh: date.day,
		dammebaihoctiemthuc: sodammebaihoctiemthuc,
		suynghihoply: sosuynghihoply,
		canbang: socanbang,
		chukycuocsong: sochukycuocsong,
		chukydinhcao: sochukydinhcao,
		chukythachthuc: sochukythachthuc,
		namcanhan: sonamcanhan,
	};
};

//console.log(main('NGUYỄN THỊ LAN HƯƠNG', '06/07/1984'));
