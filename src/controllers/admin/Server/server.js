const Server = require("../../../models/server");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

// CREATE POOL
exports.createServer = catchAsync(async (req, res, next) => {

    const { name } = req.body;

    console.log("body", req.body);

    if (!name) {
        return next(new AppError("name is required"));
    }

    const newServer = await Server.create({
        name
    });

    successResponse(res, "newServer created successfully", newServer);

});

// GET ALL POOLS
// exports.getAllServer = catchAsync(async (req, res, next) => {

//     const servers = await Server.find().sort({ createdAt: -1 });


//     if (!servers) {
//         return next(new AppError("Server not found"));
//     }

//     successResponse(res, "all Server found successfully", servers);

// });

exports.getAllServer = catchAsync(async (req, res, next) => {
    //  Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Search filter (example: name + ip)
    const filter = search
        ? {
              $or: [
                  { name: { $regex: search, $options: "i" } },
              ]
          }
        : {};

    //  Fetch data
    const servers = await Server.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    //Total count for pagination
    const total = await Server.countDocuments(filter);

    if (!servers || servers.length === 0) {
        return next(new AppError("No servers found"));
    }

   
    successResponse(res, "All servers fetched successfully", {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: servers
    });
});

// GET POOL BY ID
exports.getServerById = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const server = await Server.findById(id);

    if (!server) {
        return next(new AppError("Server not found"));
    }

    successResponse(res, "Server details found successfully", server);
});

// UPDATE POOL
exports.updateServer = catchAsync(async (req, res, next) => {

    const { id } = req.params;
    const { name } = req.body;

    const updatedServer = await Server.findByIdAndUpdate(
        id,
        { name },
        { new: true, runValidators: true }
    );

    if (!updatedServer) {
        return next(new AppError("Server not found"));
    }

    successResponse(res, "Server updated successfully", updatedServer);

});

// DELETE POOL
exports.deleteServer = catchAsync(async (req, res, next) => {
  
        const { id } = req.params;

        if (!id) {
            return next(new AppError("id is required"));
        }

        const deletedServer = await Server.findByIdAndDelete(id);

        if (!deletedServer) {
           return next( new AppError("Server not found"));
        }

        successResponse(res, "Server deleted successfully", deletedServer);
});