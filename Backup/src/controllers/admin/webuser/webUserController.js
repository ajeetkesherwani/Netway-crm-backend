const { successResponse, errorResponse } = require('../../../utils/responseHandler');  
const WebUser = require('../../../models/WebUser');
const bcrypt = require('bcrypt');
const AppError = require("../../../utils/AppError");

const validateRequiredField = (field, fieldName) => {
  if (!field || !field.trim())
    return new AppError(`${fieldName} is required.`, 400);
  return null;
};

// CREATE
exports.createWebUser = async (req, res) => {
  try {
    const {fullName,email,phone,password, address,} = req.body;
    const requiredFields = [
      { field: fullName, name: "Full Name" },
      { field: email, name: "Email" },
      { field: password, name: "Password" }
    ];

    for (const { field, name } of requiredFields) {
      validateRequiredField(field, name);
    }
    
    const existing = await WebUser.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new WebUser({
      fullName,
      email,
      phone,
      password: hashedPassword,
      address
    });
    await newUser.save();

    // success response - exclude password in response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    successResponse(res, 'WebUser created successfully', userResponse);
  } catch (error) {
    errorResponse(res, 'Failed to create WebUser', error.message);
  }
};

// READ ALL
exports.getAllWebUsers = async (req, res) => {
  try {
    const users = await WebUser.find();
    successResponse(res, 'WebUsers fetched successfully', users);
  } catch (error) {
    errorResponse(res, 'Failed to fetch WebUsers', error.message);
  }
};

// READ ONE
exports.getWebUserById = async (req, res) => {
  try {
    const user = await WebUser.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    successResponse(res, 'WebUser fetched successfully', user);
  } catch (error) {
    errorResponse(res, 'Failed to fetch WebUser', error.message);
  }
};

// UPDATE
exports.updateWebUser = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;

    // If password is being updated, hash it
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await WebUser.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    successResponse(res, 'WebUser updated successfully', updatedUser);
  } catch (error) {
    errorResponse(res, 'Failed to update WebUser', error.message);
  }
};

// DELETE
exports.deleteWebUser = async (req, res) => {
  try {
    const deletedUser = await WebUser.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    successResponse(res, 'WebUser deleted successfully', null);
  } catch (error) {
    errorResponse(res, 'Failed to delete WebUser', error.message);
  }
};
