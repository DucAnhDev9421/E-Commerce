const crypto = require('crypto');
const qs = require('qs');

function createVnpayUrl(params) {
    const date = new Date();

    const createDate = formatVnpayDate(date);
    const expDate = formatVnpayDate(new Date(date.getTime() + 15 * 60 * 1000));

    let vnpParams = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': process.env.vnp_TmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': params.orderId,
        'vnp_OrderInfo': 'Thanh toan don hang ' + params.orderId,
        'vnp_OrderType': 'other',
        'vnp_Amount': params.amount * 100,
        'vnp_ReturnUrl': params.returnUrl,
        'vnp_IpAddr': params.ipAddr,
        'vnp_CreateDate': createDate,
        'vnp_ExpireDate': expDate
    };

    vnpParams = sortObject(vnpParams);

    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnpParams['vnp_SecureHash'] = signed;

    return process.env.vnp_Url + '?' + qs.stringify(vnpParams, { encode: false });
}

function verifyVnpayReturn(vnpParams) {
    let secureHash = vnpParams['vnp_SecureHash'];

    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = sortObject(vnpParams);
    const signData = qs.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', process.env.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
}

function sortObject(obj) {
    let sorted = {};
    // Object.keys() an toàn hơn hasOwnProperty với req.query của Express
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        // VNPAY yêu cầu values phải được encode (dấu cách → '+')
        // khi tạo chuỗi ký và kiểm tra chữ ký
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
}

function formatVnpayDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}${h}${mi}${s}`;
}
module.exports = { createVnpayUrl, verifyVnpayReturn };