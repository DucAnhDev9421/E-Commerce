let UserModel = require('../schemas/users');
let bcrypt = require('bcryptjs');

let CreateAnUser = async function (data) {
    if (data.password) {
        let salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
    }
    let user = new UserModel(data);
    return await user.save();
}

let GetAllUsers = async function () {
    return await UserModel.find({ isDeleted: false }).populate('role');
}

let GetAnUserById = async function (id) {
    // Hàm này rất quan trọng cho middleware, bắt buộc populate role để lấy name
    return await UserModel.findOne({ _id: id, isDeleted: false }).populate('role');
}

let UpdateAnUser = async function (id, data) {
    if (data.password) {
        let salt = bcrypt.genSaltSync(10);
        data.password = bcrypt.hashSync(data.password, salt);
    }
    return await UserModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    );
}

let DeleteAnUser = async function (id) {
    // Soft Delete
    let user = await UserModel.findOne({ _id: id, isDeleted: false });
    if (user) {
        user.isDeleted = true;
        return await user.save();
    }
    return null;
}

module.exports = {
    CreateAnUser,
    GetAllUsers,
    GetAnUserById,
    UpdateAnUser,
    DeleteAnUser
};
