let CategoryModel = require('../schemas/categories');

module.exports = {
    CreateCategory: async function (name, description, image, status) {
        let category = new CategoryModel({
            name: name,
            description: description,
            image: image,
            status: status
        });
        return await category.save();
    },

    GetAllCategories: async function () {
        return await CategoryModel.find({ isDeleted: false });
    },

    GetCategoryById: async function (id) {
        return await CategoryModel.findOne({ _id: id, isDeleted: false });
    },

    UpdateCategory: async function (id, body) {
        return await CategoryModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { returnDocument: 'after' }
        );
    },

    DeleteCategory: async function (id) {
        let category = await CategoryModel.findOne({ _id: id, isDeleted: false });
        if (category) {
            category.isDeleted = true;
            return await category.save();
        }
        return null;
    }
};
