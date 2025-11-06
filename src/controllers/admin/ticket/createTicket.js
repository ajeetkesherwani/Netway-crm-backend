// const Ticket = require("../../../models/ticket");
// const AppError = require("../../../utils/AppError");
// const { successResponse } = require("../../../utils/responseHandler");

// exports.createTicket = (async (req, res, next) => {

//     const { userId, personName, personNumber, email, address,
//         category, callSource, severity, assignToId, callDescription, isChargable, productId, price
//     } = req.body;

//     if (!userId) return next(new AppError("userId is required"), 404);

//     const fileI = req.files.fileI ? req.files.fileI[0].filename : null;
//     const fileII = req.files.fileII ? req.files.fileII[0].filename : null;
//     const fileIII = req.files.fileIII ? req.files.fileIII[0].filename : null;

//     // Generate ticket number WEB + 8 random digits
//     const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
//     const ticketNumber = `WEB${randomNumber}`;

//     const newTicket = new Ticket({
//         userId, personName, personNumber, email, address,
//         category, callSource, severity, assignToId, callDescription, isChargable,
//         productId, price, fileI, fileII, fileIII, ticketNumber, createdById: req.user._id,
//         createdByType: req.user.role,
//     });

//     await newTicket.save();

//     successResponse(res, "new Ticket is created successfully", newTicket);

// });


const Ticket = require("../../../models/ticket");
const Retailer = require("../../../models/retailer");
const Lco = require("../../../models/lco");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.createTicket = catchAsync(async (req, res, next) => {
    const {
        userId,
        personName,
        personNumber,
        email,
        address,
        category,
        severity,
        callSource,
        fileI,
        fileII,
        fileIII,
        isChargeable,
        productId,
        price,
        callDescription,
        assignToId,
        assignToModel,
    } = req.body;

    // ✅ Step 1: Basic validation
    if (!userId || !personName || !personNumber || !severity) {
        return next(
            new AppError(" userId  personName, personNumber, and severity are required", 400)
        );
    }

    // const ticketNumber = `TCKT-${Date.now()}`;
    // Generate ticket number WEB + 8 random digits
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const ticketNumber = `WEB${randomNumber}`;
    const userRole = req.user.role; // "Admin" | "Reseller" | "Lco"
    const creatorId = req.user._id;

    let finalAssignToId = null;
    let finalAssignToModel = null;

    // ✅ Step 2: Handle assignment role rules
    if (assignToId && assignToModel) {
        if (userRole === "Admin") {
            // Admin can assign only to Staff
            if (assignToModel !== "Staff") {
                return next(new AppError("Admin can assign only to Staff", 403));
            }
            finalAssignToId = assignToId;
            finalAssignToModel = "Staff";
        }

        else if (userRole === "Reseller") {
            // Reseller can assign only to their own employees
            const reseller = await Retailer.findById(creatorId);
            if (!reseller) return next(new AppError("Reseller not found", 404));

            const emp = reseller.employeeAssociation.id(assignToId);
            if (!emp) {
                return next(
                    new AppError("You can assign tickets only to your own employees", 403)
                );
            }

            finalAssignToId = emp._id;
            finalAssignToModel = "Employee"; // "Admin" | "Manager" | "Operator"
        }

        else if (userRole === "Lco") {
            // Lco can assign only to their own employees
            const lco = await Lco.findById(creatorId);
            if (!lco) return next(new AppError("LCO not found", 404));

            const emp = lco.employeeAssociation.id(assignToId);
            if (!emp) {
                return next(
                    new AppError("You can assign tickets only to your own employees", 403)
                );
            }

            finalAssignToId = emp._id;
            finalAssignToModel = emp.type;
        }

        else {
            return next(new AppError("Unauthorized role to assign tickets", 403));
        }
    }

    // ✅ Step 3: Create the ticket with all schema fields
    const newTicket = await Ticket.create({
        userId,
        ticketNumber,
        personName,
        personNumber,
        email,
        address,
        category,
        fileI,
        fileII,
        fileIII,
        callSource,
        severity,
        callDescription,
        isChargeable,
        productId,
        price,
        createdById: creatorId,
        createdByType: userRole,
        assignToId: finalAssignToId,
        assignToModel: finalAssignToModel,
        status: finalAssignToId ? "Assigned" : "Open",
    });

    // ✅ Step 4: Return complete ticket info
    const populatedTicket = await Ticket.findById(newTicket._id)
        .populate("category")
        .populate({
            path: "assignToId",
            select: "name email type employeeUserName",
        })
        .populate({
            path: "createdById",
            select: "resellerName email phoneNo",
        });

    return successResponse(res, "Ticket created successfully", populatedTicket);
});
