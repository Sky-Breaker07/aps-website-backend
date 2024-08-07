const express = require('express');
const router = express.Router();
const { login, changePassword, resetPassword, changePasswordAndSecurityQuestion, registerMultipleStudents, deleteStudentLevel, resetAllPasswords, validToken, updateStudentProfiles, checkForceLogOut } = require('../controllers/auth');
const verifyToken = require('../middleware/authentication')
// router.post('/register', register)
router.post('/login', login);
router.post('/changepw', verifyToken, changePassword);
router.post('/resetpw', resetPassword);
router.post('/cpasq', verifyToken, changePasswordAndSecurityQuestion);
router.post('/resetAllPasswords', resetAllPasswords);
// router.get('/getStudents', fetchAndStoreStudents)
router.post('/populate', registerMultipleStudents);
router.post('/checkToken', validToken);
router.patch('/updateStudentProfiles', updateStudentProfiles);
router.delete('/deleteLevel', deleteStudentLevel);
router.get('/access', verifyToken, checkForceLogOut)

module.exports = router