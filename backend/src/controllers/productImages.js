let ProductImageModel = require('../schemas/productImages');

module.exports = {
    CreateProductImage: async function (productId, imageUrl, isPrimary, altText) {
        let productImage = new ProductImageModel({
            productId: productId,
            imageUrl: imageUrl,
            isPrimary: isPrimary,
            altText: altText
        });
        return await productImage.save();
    },

    GetAllProductImages: async function (query) {
        return await ProductImageModel.find(query || {}).populate('productId');
    },

    GetProductImagesByProductId: async function (productId) {
        return await ProductImageModel.find({ productId: productId });
    },

    GetProductImageById: async function (id) {
        return await ProductImageModel.findById(id).populate('productId');
    },

    UpdateProductImage: async function (id, body) {
        return await ProductImageModel.findByIdAndUpdate(
            id,
            body,
            { returnDocument: 'after' }
        );
    },

    DeleteProductImage: async function (id) {
        return await ProductImageModel.findByIdAndDelete(id);
    }
};
