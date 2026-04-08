let RoleModel = require('../schemas/roles');

module.exports = {
    CreateARole: async function (name, description) {
        let role = new RoleModel({
            name: name,
            description: description
        });
        return await role.save();
    },

    GetAllRoles: async function () {
        return await RoleModel.find({ isDeleted: false });
    },

    GetARoleById: async function (id) {
        return await RoleModel.findOne({ _id: id, isDeleted: false });
    },

    UpdateARole: async function (id, body) {
        return await RoleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { returnDocument: 'after' }
        );
    },

    DeleteARole: async function (id) {
        let role = await RoleModel.findOne({ _id: id, isDeleted: false });
        if (role) {
            role.isDeleted = true;
            return await role.save();
        }
        return null;
    }
};