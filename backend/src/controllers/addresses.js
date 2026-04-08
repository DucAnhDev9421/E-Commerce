let AddressModel = require('../schemas/addresses');

module.exports = {
    CreateAAddress: async function (user, street, ward, city, district, receiverName, phoneNumber, isDefault) {
        if (isDefault) {
            await AddressModel.updateMany(
                { user: user, isDefault: true },
                { isDefault: false }
            );
        }
        let address = new AddressModel({
            user: user,
            street: street,
            ward: ward,
            city: city,
            district: district,
            receiverName: receiverName,
            phoneNumber: phoneNumber,
            isDefault: isDefault || false
        });
        return await address.save();
    },

    GetAllAddresses: async function (userId) {
        return await AddressModel.find({ user: userId, isDeleted: false });
    },

    GetAAddressById: async function (id) {
        return await AddressModel.findOne({ _id: id, isDeleted: false });
    },

    UpdateAAddress: async function (id, body) {
        if (body.isDefault) {
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
            { ...body },
            { returnDocument: 'after' }
        );
    },

    DeleteAAddress: async function (id) {
        let address = await AddressModel.findOne({ _id: id, isDeleted: false });
        if (address) {
            address.isDeleted = true;
            return await address.save();
        }
        return null;
    },

    SetDefaultAddress: async function (id, userId) {
        await AddressModel.updateMany(
            { user: userId, isDeleted: false },
            { isDefault: false }
        );
        return await AddressModel.findOneAndUpdate(
            { _id: id, user: userId, isDeleted: false },
            { isDefault: true },
            { returnDocument: 'after' }
        );
    }
};