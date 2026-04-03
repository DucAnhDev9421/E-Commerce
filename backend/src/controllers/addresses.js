let AddressModel = require('../schemas/addresses');

/**
 * Create address
 * Nếu address mới là default thì reset các address default cũ của user
 */
let CreateAAddress = async function (data) {
    if (data.isDefault) {
        await AddressModel.updateMany(
            { user: data.user, isDefault: true },
            { isDefault: false }
        );
    }

    let address = new AddressModel(data);
    return await address.save();
};

/**
 * Get all addresses của user (không lấy address đã xóa)
 */
let GetAllAddresses = async function (userId) {
    return await AddressModel.find({ user: userId, isDeleted: false });
};

/**
 * Get address theo id
 */
let GetAAddressById = async function (id) {
    return await AddressModel.findOne({ _id: id, isDeleted: false });
};

/**
 * Update address
 * Nếu set default thì reset các address khác của user
 */
let UpdateAAddress = async function (id, data) {
    if (data.isDefault) {
        const currentAddr = await AddressModel.findById(id);

        if (currentAddr) {
            await AddressModel.updateMany(
                { user: currentAddr.user, isDeleted: false },
                { isDefault: false }
            );
        }
    }

    return await AddressModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { ...data },
        { returnDocument: 'after' }
    );
};

/**
 * Soft delete address
 */
let DeleteAAddress = async function (id) {
    let address = await AddressModel.findOne({ _id: id, isDeleted: false });

    if (address) {
        address.isDeleted = true;
        return await address.save();
    }

    return null;
};

/**
 * Set default address
 */
let SetDefaultAddress = async function (id, userId) {
    await AddressModel.updateMany(
        { user: userId, isDeleted: false },
        { isDefault: false }
    );

    return await AddressModel.findOneAndUpdate(
        { _id: id, user: userId, isDeleted: false },
        { isDefault: true },
        { returnDocument: 'after' }
    );
};

module.exports = {
    CreateAAddress,
    GetAllAddresses,
    GetAAddressById,
    UpdateAAddress,
    DeleteAAddress,
    SetDefaultAddress
};