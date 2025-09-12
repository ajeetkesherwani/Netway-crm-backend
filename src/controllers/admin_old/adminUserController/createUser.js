const Admin = require("../../../models_old/admin");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const {
  successResponse,
  errorResponse,
} = require("../../../utils/responseHandler");

exports.createUser = catchAsync(async (req, res) => {
  console.log(req.body);
  const { name, email, phoneNo, password, role, address, bio } = req.body;
  if (!name || !name.trim()) throw new AppError("Name is required", 400);
  if (!email || !email.trim()) throw new AppError("Email is required", 400);
  if (!role || !role.trim()) throw new AppError("role is required", 400);
  if (!phoneNo || !phoneNo.trim())
    throw new AppError("Phone number is required", 400);
  if (!password || !password.trim())
    throw new AppError("Password is required", 400);

  // Image Upload Handling (if image file is passed)
  let imagePath = "";
  if (req.files && req.files.image) {
    const file = req.files.image[0];
    imagePath = `${file.destination}/${file.filename}`;
  }

  const admin = new Admin({
    name,
    email,
    phoneNo,
    password,
    role,
    address,
    bio,
    image: imagePath,
  });

  await admin.save();
  successResponse(res, "User created successfully", { admin });
});
