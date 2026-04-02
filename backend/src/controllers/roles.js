let RoleModel = require('../schemas/roles');

let CreateARole = async function (data) {
    let role = new RoleModel(data);
    return await role.save();
}

let GetAllRoles = async function () {
    // Soft Delete: Chỉ lấy bản ghi chưa bị xóa
    return await RoleModel.find({ isDeleted: false });
}

let GetARoleById = async function (id) {
    return await RoleModel.findOne({ _id: id, isDeleted: false });
}

let UpdateARole = async function (id, data) {
    return await RoleModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    );
}

let DeleteARole = async function (id) {
    // Soft Delete: Gán isDeleted = true thay vì xóa thật
    let role = await RoleModel.findOne({ _id: id, isDeleted: false });
    if (role) {
        role.isDeleted = true;
        return await role.save();
    }
    return null;
}

module.exports = {
    CreateARole,
    GetAllRoles,
    GetARoleById,
    UpdateARole,
    DeleteARole
};
