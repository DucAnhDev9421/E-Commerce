let UserModel = require('../schemas/users');
let RoleModel = require('../schemas/roles');
let AddressModel = require('../schemas/addresses');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');


/**
 * Register user
 * - Kiểm tra trùng username/email
 * - Hash password
 * - Tạo user mới
 * - Tạo address mặc định
 */
let RegisterUser = async function (data, session) {
    // Chuẩn hóa dữ liệu về chữ thường (toLowerCase)
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
        
        // Nếu tìm thấy user đã bị xóa mềm, Xóa vĩnh viễn chúng để giải phóng Index
        if (deletedIds.length > 0) {
            await UserModel.deleteMany(
                { _id: { $in: deletedIds } }, 
                { session: session }
            );
            console.log(`Đã dọn dẹp vĩnh viễn ${deletedIds.length} tài khoản cũ đã bị xóa.`);
        }

        // Kiểm tra xem còn bất kỳ tài khoản nào đang HOẠT ĐỘNG trùng thông tin không
        const activeUser = duplicates.find(user => !user.isDeleted);
        if (activeUser) {
            let error = new Error("Email hoặc tên đăng nhập đã được sử dụng bởi một tài khoản khác.");
            error.status = 409;
            throw error;
        }
    }

    // Hash password và cập nhật dữ liệu đã chuẩn hóa
    let salt = bcrypt.genSaltSync(10);
    data.password = bcrypt.hashSync(data.password, salt);
    data.username = username;
    data.email = email;

    // Gán Role mặc định là CUSTOMER
    let customerRole = await RoleModel.findOne({ name: 'CUSTOMER' });
    if (!customerRole) {
        throw new Error("Hệ thống chưa cấu hình Role 'CUSTOMER'. Vui lòng liên hệ Admin.");
    }
    data.role = customerRole._id;

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


/**
 * Refresh access token logic
 */
let RefreshAccessToken = async function (refreshToken) {
    if (!refreshToken) {
        let error = new Error("Phiên đăng nhập hết hạn");
        error.status = 401;
        throw error;
    }

    try {
        // Verify token
        let decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        // Tìm user và kiểm tra token trong DB
        let userDB = await UserModel.findById(decoded.id);

        if (!userDB || userDB.refreshToken !== refreshToken) {
            let error = new Error("Phiên làm việc không hợp lệ hoặc đã hết hạn");
            error.status = 403;
            throw error;
        }

        // Tạo access token mới
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
};


module.exports = {
    RegisterUser,
    LoginUser,
    UpdateLoginStatus,
    UpdateRefreshToken,
    RefreshAccessToken
};