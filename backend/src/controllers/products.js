let ProductModel = require('../schemas/products');

module.exports = {
    CreateProduct: async function (name, description, price, stock, images, categoryId, status, discount) {
        let product = new ProductModel({
            name: name,
            description: description,
            price: price,
            stock: stock,
            images: images,
            categoryId: categoryId,
            status: status,
            discount: discount
        });
        return await product.save();
    },

    GetAllProducts: async function (query) {
        let filter = { isDeleted: false };

        if (query.q) {
            filter.name = { $regex: query.q, $options: 'i' };
        } else if (query.search) {
            filter.name = { $regex: query.search, $options: 'i' };
        }

        if (query.category) {
            filter.categoryId = query.category;
        } else if (query.categoryId) {
            filter.categoryId = query.categoryId;
        }

        if (query.minPrice !== undefined) {
            filter.price = { ...filter.price, $gte: Number(query.minPrice) };
        }
        if (query.maxPrice !== undefined) {
            filter.price = { ...filter.price, $lte: Number(query.maxPrice) };
        }

        let page = parseInt(query.page) || 1;
        let limit = parseInt(query.limit) || 10;
        let skip = (page - 1) * limit;

        let sortOption = {};
        if (query.sort) {
            let [field, order] = query.sort.split(':');
            sortOption[field] = order === 'desc' ? -1 : 1;
        } else {
            sortOption['createdAt'] = -1;
        }

        const items = await ProductModel.find(filter)
            .populate('categoryId')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const total = await ProductModel.countDocuments(filter);

        return {
            items,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalItems: total
        };
    },

    GetProductById: async function (id) {
        return await ProductModel.findOne({ _id: id, isDeleted: false }).populate('categoryId');
    },

    UpdateProduct: async function (id, body) {
        return await ProductModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            body,
            { returnDocument: 'after' }
        );
    },

    DeleteProduct: async function (id) {
        let product = await ProductModel.findOne({ _id: id, isDeleted: false });
        if (product) {
            product.isDeleted = true;
            return await product.save();
        }
        return null;
    }
};
