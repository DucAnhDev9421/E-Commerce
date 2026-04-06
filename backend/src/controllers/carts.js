const CartModel = require('../schemas/carts');
const ProductModel = require('../schemas/products');

let GetCartByUserId = async function (userId) {
    let cart = await CartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
        cart = await CartModel.create({ userId, items: [] });
    }
    return cart;
};

let AddItemToCart = async function (userId, productId, quantity = 1) {
    const product = await ProductModel.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");
    
    if (product.status === 'out_of_stock' || product.stock <= 0) {
        throw new Error("Sản phẩm hiện đang hết hàng");
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
        cart = new CartModel({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    const currentQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
    
    if (currentQuantity + quantity > product.stock) {
        throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    } else {
        cart.items.push({ productId, quantity });
    }

    await cart.save();
    return await CartModel.findOne({ userId }).populate('items.productId');
};

let UpdateItemQuantity = async function (userId, productId, quantity) {
    const product = await ProductModel.findById(productId);
    if (!product) throw new Error("Sản phẩm không tồn tại");

    if (quantity > product.stock) {
        throw new Error(`Chỉ còn ${product.stock} sản phẩm trong kho`);
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
    } else {
        throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    return await CartModel.findOne({ userId }).populate('items.productId');
};

let RemoveItemFromCart = async function (userId, productId) {
    let cart = await CartModel.findOne({ userId });
    if (!cart) throw new Error("Giỏ hàng không tồn tại");

    cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
    await cart.save();
    
    return await CartModel.findOne({ userId }).populate('items.productId');
};

let ClearCart = async function (userId) {
    let cart = await CartModel.findOne({ userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return cart;
};

module.exports = {
    GetCartByUserId,
    AddItemToCart,
    UpdateItemQuantity,
    RemoveItemFromCart,
    ClearCart
};
