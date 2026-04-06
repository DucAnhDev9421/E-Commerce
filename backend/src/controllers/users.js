let UserModel = require('../schemas/users');
let bcrypt = require('bcryptjs');

module.exports = {
    CreateAnUser: async function (username, password, email, role, fullName, phone, avatarUrl) {
        if (password) {
            let salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(password, salt);
        }
        let user = new UserModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            phone: phone,
            avatarUrl: avatarUrl
        });
        return await user.save();
    },

    GetAllUsers: async function () {
        return await UserModel
            .find({ isDeleted: false })
            .populate('role');
    },

    GetAnUserById: async function (id) {
        return await UserModel
            .findOne({ _id: id, isDeleted: false })
            .populate('role');
    },

    UpdateAnUser: async function (id, body) {
        if (body.password) {
            let salt = bcrypt.genSaltSync(10);
            body.password = bcrypt.hashSync(body.password, salt);
        }
        return await UserModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { returnDocument: 'after' }
        ).populate('role');
    },

    DeleteAnUser: async function (id) {
        let user = await UserModel.findOne({ _id: id, isDeleted: false });
        if (user) {
            const timestamp = Date.now();
            user.isDeleted = true;
            user.username = `deleted_${timestamp}_${user.username}`;
            user.email = `deleted_${timestamp}_${user.email}`;
            return await user.save();
        }
        return null;
    },

    ChangePassword: async function (id, oldPassword, newPassword) {
        let user = await UserModel.findOne({ _id: id, isDeleted: false });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        const isMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isMatch) {
            throw new Error("Mật khẩu cũ không chính xác");
        }
        if (newPassword === oldPassword) {
            throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
        }
        if (newPassword.length < 6) {
            throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        let salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(newPassword, salt);
        return await user.save();
    }
};