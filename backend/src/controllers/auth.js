let UserModel = require('../schemas/users');
let AddressModel = require('../schemas/addresses');
let bcrypt = require('bcryptjs');


/**
 * Register user
 * - Kiểm tra trùng username/email
 * - Hash password
 * - Tạo user mới
 * - Tạo address mặc định
 */
let RegisterUser = async function (data, session) {
    // 1. Chuẩn hóa dữ liệu về chữ thường (toLowerCase)
    const username = data.username.toLowerCase();
    const email = data.email.toLowerCase();

    /**
     * 2. Tìm TẤT CẢ user trùng khớp (bao gồm cả đã xóa mềm và đang hoạt động)
     */
    let duplicates = await UserModel.find({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    console.log("Tìm thấy user trùng:", duplicates);

    if (duplicates.length > 0) {
        // Lấy danh sách ID của các user đã bị xóa mềm
        const deletedIds = duplicates
            .filter(user => user.isDeleted)
            .map(user => user._id);
        
        // 3. Nếu tìm thấy user đã bị xóa mềm, Xóa vĩnh viễn chúng để giải phóng Index
        if (deletedIds.length > 0) {
            await UserModel.deleteMany(
                { _id: { $in: deletedIds } }, 
                { session: session }
            );
            console.log(`Đã dọn dẹp vĩnh viễn ${deletedIds.length} tài khoản cũ đã bị xóa.`);
        }

        // 4. Kiểm tra xem còn bất kỳ tài khoản nào đang HOẠT ĐỘNG trùng thông tin không
        const activeUser = duplicates.find(user => !user.isDeleted);
        if (activeUser) {
            let error = new Error("Email hoặc tên đăng nhập đã được sử dụng bởi một tài khoản khác.");
            error.status = 409;
            throw error;
        }
    }

    // 5. Hash password và cập nhật dữ liệu đã chuẩn hóa
    let salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password, salt);
    data.username = username;
    data.email = email;

    let user = new UserModel(data);
    let savedUser = await user.save({ session: session });

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
};


/**
 * Login user
 * Tìm username không phân biệt hoa thường
 */
let LoginUser = async function (username) {
    return await UserModel.findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') },
        isDeleted: false
    });
};


/**
 * Update login status
 */
let UpdateLoginStatus = async function (user) {
    return await user.save();
};


/**
 * Cập nhật refresh token cho user
 */
let UpdateRefreshToken = async function (userId, token) {
    return await UserModel.findByIdAndUpdate(
        userId,
        { refreshToken: token },
        { returnDocument: 'after' }
    );
};


module.exports = {
    RegisterUser,
    LoginUser,
    UpdateLoginStatus,
    UpdateRefreshToken
};