let UserModel = require('../schemas/users');
let bcrypt = require('bcryptjs');


/**
 * Create user
 * Nếu có password thì hash trước khi lưu
 */
let CreateAnUser = async function (data) {

    if (data.password) {
        let salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
    }

    let user = new UserModel(data);
    return await user.save();
};


/**
 * Get all users
 * Populate role để lấy thông tin role
 */
let GetAllUsers = async function () {
    return await UserModel
        .find({ isDeleted: false })
        .populate('role');
};


/**
 * Get user theo id
 * Quan trọng cho middleware nên cần populate role
 */
let GetAnUserById = async function (id) {
    return await UserModel
        .findOne({ _id: id, isDeleted: false })
        .populate('role');
};


/**
 * Update user
 * Nếu cập nhật password thì hash lại
 */
let UpdateAnUser = async function (id, data) {

    if (data.password) {
        let salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
    }

    return await UserModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { returnDocument: 'after' }
    ).populate('role');
};


/**
 * Soft delete user
 * Đổi username và email để tránh trùng khi tạo user mới
 */
let DeleteAnUser = async function (id) {

    let user = await UserModel.findOne({ _id: id, isDeleted: false });

    if (user) {
        const timestamp = Date.now();

        user.isDeleted = true;
        user.username = `deleted_${timestamp}_${user.username}`;
        user.email = `deleted_${timestamp}_${user.email}`;

        return await user.save();
    }

    return null;
};


/**
 * Change password
 */
let ChangePassword = async function (id, oldPassword, newPassword) {
    let user = await UserModel.findOne({ _id: id, isDeleted: false });
    if (!user) {
        throw new Error("Người dùng không tồn tại");
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
        throw new Error("Mật khẩu cũ không chính xác");
    }

    // Validation mật khẩu mới
    if (newPassword === oldPassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    if (newPassword.length < 6) {
        throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    // Hash và cập nhật
    let salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    
    return await user.save();
};


module.exports = {
    CreateAnUser,
    GetAllUsers,
    GetAnUserById,
    UpdateAnUser,
    DeleteAnUser,
    ChangePassword
};