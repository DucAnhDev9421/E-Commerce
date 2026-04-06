let express = require('express');
let router = express.Router();

let multer = require('multer');
let path = require('path');
let fs = require('fs');

let { verifyToken, checkRole } = require('../utils/authHandler');


/**
 * Tạo thư mục uploads nếu chưa tồn tại
 */
let uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


/**
 * Cấu hình nơi lưu file
 */
let storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }

});


/**
 * Middleware upload
 */
let upload = multer({ storage: storage });


/**
 * Upload file (Yêu cầu đăng nhập)
 */
router.post(
    '/',
    verifyToken,
    upload.single('image'),
    function (req, res, next) {

        try {

            if (!req.file) {
                return res.status(400).send({
                    message: "Không có file nào được tải lên"
                });
            }

            res.send({
                success: true,
                filename: req.file.filename,
                avatarUrl: "/uploads/" + req.file.filename
            });

        } catch (error) {
            res.status(500).send({ message: error.message });
        }

    }
);


module.exports = router;