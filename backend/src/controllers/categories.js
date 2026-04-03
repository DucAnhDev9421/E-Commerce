let CategoryModel = require('../schemas/categories');

let CreateCategory = async function (data) {
    let category = new CategoryModel(data);
    return await category.save();
}

let GetAllCategories = async function () {
    return await CategoryModel.find({ isDeleted: false });
}

let GetCategoryById = async function (id) {
    return await CategoryModel.findOne({ _id: id, isDeleted: false });
}

let UpdateCategory = async function (id, data) {
    return await CategoryModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    );
}

let DeleteCategory = async function (id) {
    let category = await CategoryModel.findOne({ _id: id, isDeleted: false });
    if (category) {
        category.isDeleted = true;
        return await category.save();
    }
    return null;
}

module.exports = {
    CreateCategory,
    GetAllCategories,
    GetCategoryById,
    UpdateCategory,
    DeleteCategory
};
