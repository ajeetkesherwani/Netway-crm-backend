const Ticket = require("../../../../models/ticket");
const Admin = require("../../../../models/admin");
const Reseller = require("../../../../models/retailer");
const Lco = require("../../../../models/lco");
const TicketReply = require("../../../../models/ticketReply");
const AppError = require("../../../../utils/AppError");
const catchAsync = require("../../../../utils/catchAsync");
const { successResponse } = require("../../../../utils/responseHandler");

exports.getResolvedTicketList = catchAsync(async (req, res, next) => {
    // Fetch open tickets
    const tickets = await Ticket.find({ status: "Resolved" })
        .populate({
            path: "assignToId",
            select: "name",
        })
        .populate({
            path: "userId",
            select:
                "generalInformation.username generalInformation.createdFor",
        })
        .sort({ createdAt: -1 });
    // console.log(tickets, "ticket");

    if (!tickets || tickets.length === 0)
        return next(new AppError("Open Tickets not found", 404));

    //Format with dynamic user/reseller/lco/admin info
    const formattedTickets = await Promise.all(
        tickets.map(async (t) => {
            const user = t.userId;
            let userBelongsTo = "N/A";
            let userBelongsToType = "N/A";
            let lastModifiedByName = "N/A";

            //  Step 1: Find user’s createdFor → means user belongs to which Reseller/LCO/Admin
            if (user?.generalInformation?.createdFor) {
                const { id, type } = user.generalInformation.createdFor;
                userBelongsToType = type;

                const modelMap = {
                    Lco: { model: Lco, field: "lcoName" },
                    Retailer: { model: Reseller, field: "resellerName" },
                    Admin: { model: Admin, field: "name" },
                };

                const modelInfo = modelMap[type];
                if (modelInfo) {
                    const doc = await modelInfo.model.findById(id).select(modelInfo.field);
                    userBelongsTo = doc ? doc[modelInfo.field] : "N/A";
                } else if (type === "Self") {
                    userBelongsTo = "Self";
                }
            }


            //Step 2: Find who created the ticket → Admin / Reseller / LCO
            if (t.createdById && t.createdByType) {
                const id = t.createdById;
                const type = t.createdByType;
                let createdByName = "N/A";

                if (type === "Lco") {
                    const lco = await Lco.findById(id).select("lcoName");
                    createdByName = lco?.lcoName || "N/A";
                } else if (type === "Reseller") {
                    const reseller = await Reseller.findById(id).select("resellerName");
                    createdByName = reseller?.resellerName || "N/A";
                } else if (type === "Admin") {
                    const admin = await Admin.findById(id).select("name");
                    createdByName = admin?.name || "Admin";
                }

                t.createdByName = createdByName; // optional — attach name directly to response
            }


            // Step 3: Find who last modified the ticket
            if (t.lastModifiedBy && t.lastModifiedByType) {
                const id = t.lastModifiedBy;
                const type = t.lastModifiedByType;


                if (type === "Lco") {
                    const lco = await Lco.findById(id).select("lcoName");
                    lastModifiedByName = lco?.lcoName || "N/A";
                } else if (type === "Reseller") {
                    const reseller = await Reseller.findById(id).select("resellerName");
                    lastModifiedByName = reseller?.resellerName || "N/A";
                } else if (type === "Admin") {
                    const admin = await Admin.findById(id).select("name");
                    lastModifiedByName = admin?.name || "Admin";
                }
            }


            //Step 4: Get latest ticket reply (by createdAt)
            const latestReply = await TicketReply.findOne({ ticket: t._id })
                .sort({ createdAt: -1 })
                .select("description");



            return {
                ticketId: t._id,
                date: t.createdAt?.toISOString().split("T")[0],
                ticketNumber: t.ticketNumber,
                description: latestReply || "N/A",
                userName: user?.generalInformation?.username || "N/A",
                userBelongsTo,
                // userBelongsToType, // whose user it is (Reseller / LCO / Admin)
                status: t.status,
                assignTo: t.assignToId?.name || "N/A",
                createdByName: t.createdByName || "N/A",
                lastModifiedByName,
                createdAt: new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
                updatedAt: new Date(t.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            };
        })
    );

    successResponse(res, "resolved tickets fetched successfully", formattedTickets);
});