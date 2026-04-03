let ProductModel = require('../schemas/products');

let CreateProduct = async function (data) {
    let product = new ProductModel(data);
    return await product.save();
}

let GetAllProducts = async function (query = {}) {
    let filter = { isDeleted: false };
    if (query.search) {
        filter.name = { $regex: query.search, $options: 'i' };
    }
    if (query.categoryId) {
        filter.categoryId = query.categoryId;
    }
    return await ProductModel.find(filter).populate('categoryId');
}

let GetProductById = async function (id) {
    return await ProductModel.findOne({ _id: id, isDeleted: false }).populate('categoryId');
}

let UpdateProduct = async function (id, data) {
    return await ProductModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    );
}

let DeleteProduct = async function (id) {
    let product = await ProductModel.findOne({ _id: id, isDeleted: false });
    if (product) {
        product.isDeleted = true;
        return await product.save();
    }
    return null;
}

module.exports = {
    CreateProduct,
    GetAllProducts,
    GetProductById,
    UpdateProduct,
    DeleteProduct
};
