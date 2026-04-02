let express = require('express');
let router = express.Router();
let roleController = require('../controllers/roles');

router.post('/', async function (req, res, next) {
    try {
        let result = await roleController.CreateARole(req.body);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.get('/', async function (req, res, next) {
    try {
        let result = await roleController.GetAllRoles();
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.get('/:id', async function (req, res, next) {
    try {
        let result = await roleController.GetARoleById(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy role" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.put('/:id', async function (req, res, next) {
    try {
        let result = await roleController.UpdateARole(req.params.id, req.body);
        if (!result) return res.status(404).send({ message: "Không tìm thấy role để update" });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

router.delete('/:id', async function (req, res, next) {
    try {
        let result = await roleController.DeleteARole(req.params.id);
        if (!result) return res.status(404).send({ message: "Không tìm thấy role để xóa" });
        res.send({ message: "Xóa thành công (soft delete)" });
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

module.exports = router;
