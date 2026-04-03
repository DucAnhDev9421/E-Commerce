let RoleModel = require('../schemas/roles');


/**
 * Create role
 */
let CreateARole = async function (data) {
    let role = new RoleModel(data);
    return await role.save();
};


/**
 * Get all roles
 * Soft delete: chỉ lấy role chưa bị xóa
 */
let GetAllRoles = async function () {
    return await RoleModel.find({ isDeleted: false });
};


/**
 * Get role theo id
 */
let GetARoleById = async function (id) {
    return await RoleModel.findOne({ _id: id, isDeleted: false });
};


/**
 * Update role
 */
let UpdateARole = async function (id, data) {
    return await RoleModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { returnDocument: 'after' }
    );
};


/**
 * Soft delete role
 */
let DeleteARole = async function (id) {
    let role = await RoleModel.findOne({ _id: id, isDeleted: false });

    if (role) {
        role.isDeleted = true;
        return await role.save();
    }

    return null;
};


module.exports = {
    CreateARole,
    GetAllRoles,
    GetARoleById,
    UpdateARole,
    DeleteARole
};