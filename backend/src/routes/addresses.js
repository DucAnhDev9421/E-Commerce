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
        let data = req.body;

        // Gán user từ token
        data.user = req.user._id;

        let result = await addressController.CreateAAddress(data);
        res.status(201).send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Get all addresses của user đang đăng nhập
 */
router.get('/', verifyToken, async function (req, res, next) {
    try {

        let result = await addressController.GetAllAddresses(req.user._id);
        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Get address theo id
 */
router.get('/:id', async function (req, res, next) {
    try {

        let result = await addressController.GetAAddressById(req.params.id);

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy địa chỉ" });
        }

        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Update address
 */
router.put('/:id', async function (req, res, next) {
    try {

        let result = await addressController.UpdateAAddress(req.params.id, req.body);

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy địa chỉ để update" });
        }

        res.send(result);

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


/**
 * Soft delete address
 */
router.delete('/:id', async function (req, res, next) {
    try {

        let result = await addressController.DeleteAAddress(req.params.id);

        if (!result) {
            return res.status(404).send({ message: "Không tìm thấy địa chỉ để xóa" });
        }

        res.send({ message: "Xóa thành công (soft delete)" });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});


module.exports = router;