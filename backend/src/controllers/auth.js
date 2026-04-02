let UserModel = require('../schemas/users');
let AddressModel = require('../schemas/addresses');
let bcrypt = require('bcryptjs');

let RegisterUser = async function (data, session) {
    let salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password, salt);
    
    let user = new UserModel(data);
    let savedUser = await user.save({ session: session });
    
    // Tạo Address mặc định theo schema mới nhất của bạn
    let defaultAddress = new AddressModel({
        user: savedUser._id,
        street: "Chưa cập nhật",
        city: "Chưa cập nhật",
        district: "Chưa cập nhật",
        receiverName: savedUser.fullName,
        phoneNumber: savedUser.phone || "Chưa có"
    });
    await defaultAddress.save({ session: session });
    
    return savedUser;
}

let LoginUser = async function (username) {
    return await UserModel.findOne({ username: username, isDeleted: false });
}

let UpdateLoginStatus = async function (user) {
    return await user.save();
}

// DAO: Cập nhật Refresh Token cho User
let UpdateRefreshToken = async function (userId, token) {
    return await UserModel.findByIdAndUpdate(userId, { refreshToken: token }, { new: true });
}

module.exports = {
    RegisterUser,
    LoginUser,
    UpdateLoginStatus,
    UpdateRefreshToken
};
