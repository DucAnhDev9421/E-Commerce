let express = require('express');
let router = express.Router();
let multer = require('multer');
let path = require('path');
let fs = require('fs');

// Cấu hình lưu trữ tại chỗ
let uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({ storage: storage });

// Route xử lý upload avatar
router.post('/avatar', upload.single('avatar'), function (req, res, next) {
    try {
        if (!req.file) {
            return res.status(404).send({ message: "Không có file nào được tải lên" });
        }
        // Trả về thông tin file theo yêu cầu
        res.send({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            avatarUrl: "/uploads/" + req.file.filename
        });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
