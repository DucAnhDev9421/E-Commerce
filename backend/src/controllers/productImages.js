let ProductImageModel = require('../schemas/productImages');

let CreateProductImage = async function (data) {
    let productImage = new ProductImageModel(data);
    return await productImage.save();
}

let GetAllProductImages = async function (query = {}) {
    return await ProductImageModel.find(query).populate('productId');
}

let GetProductImagesByProductId = async function (productId) {
    return await ProductImageModel.find({ productId: productId });
}

let GetProductImageById = async function (id) {
    return await ProductImageModel.findById(id).populate('productId');
}

let UpdateProductImage = async function (id, data) {
    return await ProductImageModel.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
}

let DeleteProductImage = async function (id) {
    return await ProductImageModel.findByIdAndDelete(id);
}

module.exports = {
    CreateProductImage,
    GetAllProductImages,
    GetProductImagesByProductId,
    GetProductImageById,
    UpdateProductImage,
    DeleteProductImage
};
