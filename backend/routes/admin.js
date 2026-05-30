const express = require('express');
const router = express.Router();
const adminController = require('../adminController');
const auth = require('../authMiddleware');
const { isAdmin } = require('../companyMiddleware');

// @route   PUT api/admin/companies/:id/approve
// @desc    Şirketi onayla
// @access  Private (Admin)
router.put('/companies/:id/approve', [auth, isAdmin], adminController.approveCompany);

// @route   PUT api/admin/companies/:id/reject
// @desc    Şirketi reddet
// @access  Private (Admin)
router.delete('/companies/:id/reject', [auth, isAdmin], adminController.rejectCompany);

// @route   GET api/admin/users
// @desc    Tüm kullanıcıları listele
// @access  Private (Admin)
router.get('/users', [auth, isAdmin], adminController.getAllUsers);

// @route   DELETE api/admin/listings/:id
// @desc    İlan sil
// @access  Private (Admin)
router.delete('/listings/:id', [auth, isAdmin], adminController.deleteListing);

module.exports = router;
