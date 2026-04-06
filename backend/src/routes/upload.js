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
    upload.any(),
    function (req, res) {

        try {

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Không có file nào được tải lên",
                    data: null
                });
            }

            const file = req.files[0];
            return res.status(200).json({
                success: true,
                message: "Tải ảnh lên thành công",
                data: {
                    filename: file.filename,
                    avatarUrl: "/uploads/" + file.filename
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }

    }
);


module.exports = router;