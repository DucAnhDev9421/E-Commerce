let express = require('express');
let router = express.Router();

let addressController = require('../controllers/addresses');
let { verifyToken } = require('../utils/authHandler');


/**
 * Create address
 * User được lấy từ token
 */
router.post('/', verifyToken, async function (req, res, next) {
    try {
        const { street, ward, city, district, receiverName, phoneNumber, isDefault } = req.body;

        let result = await addressController.CreateAAddress(
            req.user._id, street, ward, city, district, receiverName, phoneNumber, isDefault
        );
        res.status(201).json({ success: true, message: "Tạo địa chỉ thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Get all addresses của user đang đăng nhập
 */
router.get('/', verifyToken, async function (req, res, next) {
    try {

        let result = await addressController.GetAllAddresses(req.user._id);
        res.status(200).json({ success: true, message: "Lấy danh sách địa chỉ thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Get address theo id
 */
router.get('/:id', verifyToken, async function (req, res, next) {
    try {

        let result = await addressController.GetAAddressById(req.params.id);

        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ", data: null });
        }

        res.status(200).json({ success: true, message: "Lấy chi tiết địa chỉ thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Update address
 */
router.put('/:id', verifyToken, async function (req, res, next) {
    try {

        let existingAddress = await addressController.GetAAddressById(req.params.id);

        if (!existingAddress) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ để cập nhật", data: null });
        }

        let result = await addressController.UpdateAAddress(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Cập nhật địa chỉ thành công", data: result });

    } catch (error) {
        next(error);
    }
});


/**
 * Soft delete address
 */
router.delete('/:id', verifyToken, async function (req, res, next) {
    try {

        let existingAddress = await addressController.GetAAddressById(req.params.id);

        if (!existingAddress) {
            return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ để xóa", data: null });
        }

        let result = await addressController.DeleteAAddress(req.params.id);
        res.status(200).json({ success: true, message: "Xóa địa chỉ thành công (soft delete)", data: result });

    } catch (error) {
        next(error);
    }
});


module.exports = router;
