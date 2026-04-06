let UserModel = require('../schemas/users');
let RoleModel = require('../schemas/roles');
let AddressModel = require('../schemas/addresses');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

module.exports = {
    RegisterUser: async function (username, email, password, fullName, phone, session) {
        username = username.toLowerCase();
        email = email.toLowerCase();

        let duplicates = await UserModel.find({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        console.log("Tìm thấy user trùng:", duplicates);

        if (duplicates.length > 0) {
            const deletedIds = duplicates
                .filter(user => user.isDeleted)
                .map(user => user._id);

            if (deletedIds.length > 0) {
                await UserModel.deleteMany(
                    { _id: { $in: deletedIds } },
                    { session: session }
                );
                console.log(`Đã dọn dẹp vĩnh viễn ${deletedIds.length} tài khoản cũ đã bị xóa.`);
            }

            const activeUser = duplicates.find(user => !user.isDeleted);
            if (activeUser) {
                let error = new Error("Email hoặc tên đăng nhập đã được sử dụng bởi một tài khoản khác.");
                error.status = 409;
                throw error;
            }
        }

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);

        let customerRole = await RoleModel.findOne({ name: 'CUSTOMER' });
        if (!customerRole) {
            throw new Error("Hệ thống chưa cấu hình Role 'CUSTOMER'. Vui lòng liên hệ Admin.");
        }

        let user = new UserModel({
            username: username,
            email: email,
            password: hashedPassword,
            fullName: fullName,
            phone: phone,
            role: customerRole._id
        });
        let savedUser = await user.save({ session: session });

        let defaultAddress = new AddressModel({
            user: savedUser._id,
            street: "Chưa cập nhật",
            ward: "Chưa cập nhật",
            city: "Chưa cập nhật",
            district: "Chưa cập nhật",
            receiverName: fullName,
            phoneNumber: phone || "Chưa có"
        });
        await defaultAddress.save({ session: session });

        return savedUser;
    },

    LoginUser: async function (username) {
        return await UserModel.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') },
            isDeleted: false
        });
    },

    UpdateLoginStatus: async function (user) {
        return await user.save();
    },

    UpdateRefreshToken: async function (userId, token) {
        return await UserModel.findByIdAndUpdate(
            userId,
            { refreshToken: token },
            { returnDocument: 'after' }
        );
    },

    RefreshAccessToken: async function (refreshToken) {
        if (!refreshToken) {
            let error = new Error("Phiên đăng nhập hết hạn");
            error.status = 401;
            throw error;
        }

        try {
            let decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET
            );

            let userDB = await UserModel.findById(decoded.id);

            if (!userDB || userDB.refreshToken !== refreshToken) {
                let error = new Error("Phiên làm việc không hợp lệ hoặc đã hết hạn");
                error.status = 403;
                throw error;
            }

            let newAccessToken = jwt.sign(
                { id: userDB._id },
                process.env.JWT_ACCESS_SECRET,
                { expiresIn: '15m' }
            );

            return newAccessToken;

        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                let error = new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
                error.status = 401;
                throw error;
            }
            throw err;
        }
    }
};