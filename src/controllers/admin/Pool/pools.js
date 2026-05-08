const Pool = require("../../../models/pools");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

// CREATE POOL
exports.createPool = catchAsync(async (req, res, next) => {

    const { poolName } = req.body;

    if (!poolName) {
        return next(new AppError("poolName is required"));
    }

    const newPool = await Pool.create({
        poolName
    });

    successResponse(res, "pools created successfully", newPool);

});

// GET ALL POOLS
// exports.getAllPools = catchAsync(async (req, res, next) => {

//     const pools = await Pool.find().sort({ createdAt: -1 });

//     console.log("pools", pools);

//     if (!pools) {
//         return next(new AppError("pools not found"));
//     }

//     successResponse(res, "all pools found successfully", pools);

// });
exports.getAllPools = catchAsync(async (req, res, next) => {
    // 1. Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // 2. Search filter (adjust fields based on your schema)
    const filter = search
        ? {
              $or: [
                  { poolName: { $regex: search, $options: "i" } },
              ]
          }
        : {};

    // 3. Fetch data
    const pools = await Pool.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // 4. Total count
    const total = await Pool.countDocuments(filter);

    // 5. Handle empty result
    if (pools.length === 0) {
        return next(new AppError("No pools found"));
    }

    // 6. Response
    successResponse(res, "All pools fetched successfully", {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: pools
    });
});

// GET POOL BY ID
exports.getPoolById = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const pool = await Pool.findById(id);

    if (!pool) {
        return next(new AppError("pools not found"));
    }

    successResponse(res, "pools details found successfully", pool);
});

// UPDATE POOL
exports.updatePool = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const { poolName } = req.body;

    const updatedPool = await Pool.findByIdAndUpdate(
        id,
        { poolName },
        { new: true, runValidators: true }
    );

    if (!updatedPool) {
        return next(new AppError("pools not found"));
    }

    successResponse(res, "pools updated successfully", updatedPool);

});

// DELETE POOL
exports.deletePool = catchAsync(async (req, res, next) => {
  
        const { id } = req.params;

        if (!id) {
            return next(new AppError("id is required"));
        }

        const deletedPool = await Pool.findByIdAndDelete(id);

        if (!deletedPool) {
           return next( new AppError("Pool not found"));
        }

        successResponse(res, "Pool deleted successfully", deletedPool);
});