let express = require('express');
let router = express.Router();
let addressController = require('../controllers/addresses');

router.post('/', async function (req, res, next) {
    try {
        // Áp dụng gán userId cho trường user trong schema
        let data = req.body;
        if (data.userId) data.user = data.userId;
        
        let result = await addressController.CreateAAddress(data);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.get('/', async function (req, res, next) {
    try {
        let result = await addressController.GetAllAddresses();
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        let result = await addressController.GetAAddressById(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy địa chỉ" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        let result = await addressController.UpdateAAddress(req.params.id, req.body);
        if (!result) return res.status(404).send({ message: "Không tìm thấy địa chỉ để update" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        let result = await addressController.DeleteAAddress(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy địa chỉ để xóa" });
        res.send({ message: "Xóa thành công (soft delete)" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
