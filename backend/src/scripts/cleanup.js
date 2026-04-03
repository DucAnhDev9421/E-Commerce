const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load biến môi trường từ .env
dotenv.config();

const UserModel = require('../schemas/users');


/**
 * Script dọn dẹp dữ liệu user đã soft delete
 * Đổi username/email để tránh trùng unique index
 */
const cleanup = async () => {

    try {

        // Kết nối MongoDB
        const URI =
            process.env.MONGO_URI ||
            'mongodb://127.0.0.1:27017/NNPTUD-C4';

        await mongoose.connect(URI);

        console.log("Đã kết nối MongoDB.");


        /**
         * Tìm các user đã bị soft delete
         * nhưng username/email chưa được đổi
         */
        const usersToFix = await UserModel.find({
            isDeleted: true,
            $and: [
                { username: { $not: /^deleted_/ } },
                { email: { $not: /^deleted_/ } }
            ]
        });

        console.log(`Tìm thấy ${usersToFix.length} user cần xử lý dọn dẹp.`);


        /**
         * Rename username + email
         */
        for (const user of usersToFix) {

            const timestamp = Date.now();

            const oldUsername = user.username;
            const oldEmail = user.email;

            user.username = `deleted_${timestamp}_${oldUsername}`;
            user.email = `deleted_${timestamp}_${oldEmail}`;

            await user.save();

            console.log(
                `Đã xử lý: ${oldUsername} -> ${user.username}`
            );
        }

        console.log("Hoàn tất dọn dẹp dữ liệu.");

        process.exit(0);

    } catch (error) {

        console.error("Lỗi dọn dẹp:", error);

        process.exit(1);
    }

};


cleanup();