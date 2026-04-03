const CartModel = require('../schemas/carts');

let GetCartByUserId = async function (userId) {
    let cart = await CartModel.findOne({ userId }).populate('items.productId');
    if (!cart) {
        cart = await CartModel.create({ userId, items: [] });
    }
    return cart;
};

let AddItemToCart = async function (userId, productId, quantity = 1) {
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
        cart = new CartModel({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    } else {
        cart.items.push({ productId, quantity });
    }

    await cart.save();
    return await CartModel.findOne({ userId }).populate('items.productId');
};

let UpdateItemQuantity = async function (userId, productId, quantity) {
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
