let AddressModel = require('../schemas/addresses');

let CreateAAddress = async function (data) {
    let address = new AddressModel(data);
    return await address.save();
}

let GetAllAddresses = async function () {
    return await AddressModel.find({ isDeleted: false });
}

let GetAAddressById = async function (id) {
    return await AddressModel.findOne({ _id: id, isDeleted: false });
}

let UpdateAAddress = async function (id, data) {
    return await AddressModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        data,
        { new: true }
    );
}

let DeleteAAddress = async function (id) {
    let address = await AddressModel.findOne({ _id: id, isDeleted: false });
    if (address) {
        address.isDeleted = true;
        return await address.save();
    }
    return null;
}

module.exports = {
    CreateAAddress,
    GetAllAddresses,
    GetAAddressById,
    UpdateAAddress,
    DeleteAAddress
};
