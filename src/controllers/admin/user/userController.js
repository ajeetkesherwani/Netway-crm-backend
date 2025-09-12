const User = require('../../../models/user');
const Staff = require('../../../models/Staff');
const Role = require('../../../models/role');
const bcrypt = require('bcrypt');
const {successResponse,errorResponse} = require('../../../utils/responseHandler');

// CREATE
exports.createUser = async (req, res) => {
  try {
    const { password, staffData, role, ...rest } = req.body;

    const existingUser = await User.findOne({ email: rest.email });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 400);
    }

    const roleDoc = await Role.findById(role);
    console.log(roleDoc);
    if (!roleDoc) {
      return errorResponse(res, 'Invalid role ID provided', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let staffRef = null;

    if (roleDoc.roleName.toLowerCase() !== 'admin' && staffData) {
      const newStaff = new Staff({
        logId: rest.username,
        staffName: staffData.staffName,
        salary: staffData.salary,
        comment: staffData.comment,
        area: staffData.area,
        staffIp: staffData.staffIp
      });
      const savedStaff = await newStaff.save();
      staffRef = savedStaff._id;
    }

    // Create the user
    const user = new User({
      ...rest,
      role, 
      password: hashedPassword,
      staffData: staffRef
    });

    await user.save();
    successResponse(res, 'User created successfully', user, 201);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
};

// READ ALL
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('staffData');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ ONE
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('staffData');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  try {
    const { staffData, role, password, ...rest } = req.body;

    // Find the user first
    const user = await User.findById(req.params.id).populate('staffData');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the role
    const roleDoc = await Role.findById(role || user.role); // fallback to existing role
    if (!roleDoc) {
      return res.status(400).json({ error: 'Invalid role ID' });
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update user fields
    Object.assign(user, rest);

    // Update role if it was sent
    if (role) {
      user.role = role;
    }

    // Update staffData if:
    // - staffData is sent in request
    // - AND the role is not "Admin"
    if (roleDoc.roleName.toLowerCase() !== 'admin' && staffData) {
      if (user.staffData) {
        // Update existing staff
        await Staff.findByIdAndUpdate(user.staffData._id, {
          staffName: staffData.staffName,
          salary: staffData.salary,
          comment: staffData.comment,
          area: staffData.area,
          staffIp: staffData.staffIp
        });
      } else {
        // Create new staff record if none linked
        const newStaff = new Staff({
          logId: user.username,
          staffName: staffData.staffName,
          salary: staffData.salary,
          comment: staffData.comment,
          area: staffData.area,
          staffIp: staffData.staffIp
        });
        const savedStaff = await newStaff.save();
        user.staffData = savedStaff._id;
      }
    } else if (roleDoc.roleName.toLowerCase() === 'admin') {
      // If role is admin, detach staffData if exists
      user.staffData = null;
    }

    // Save the updated user
    const updatedUser = await user.save();
    const populatedUser = await updatedUser.populate('staffData');

    res.json(populatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
