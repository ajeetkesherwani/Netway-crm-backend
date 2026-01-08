const Ticket = require("../../../models/ticket");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const { successResponse } = require("../../../utils/responseHandler");

exports.getCountSummary = catchAsync(async (req, res) => {

  /* -------------------------------------------------
     1️⃣ TICKET COUNT BY STATUS
  ------------------------------------------------- */
  const ticketAggregation = await Ticket.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const ticketCounts = {};
  let totalTickets = 0;

  ticketAggregation.forEach(t => {
    ticketCounts[t._id] = t.count;
    totalTickets += t.count;
  });

  ticketCounts.total = totalTickets;

  /* -------------------------------------------------
     2️⃣ CAF UPLOADED vs NOT UPLOADED USERS
     CAF Uploaded = Caf Form exists & has image
  ------------------------------------------------- */
  const cafAggregation = await User.aggregate([
    {
      $project: {
        cafUploaded: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$document",
                      as: "doc",
                      cond: {
                        $and: [
                          { $eq: ["$$doc.documentType", "Caf Form"] },
                          { $gt: [{ $size: "$$doc.documentImage" }, 0] }
                        ]
                      }
                    }
                  }
                },
                0
              ]
            },
            "uploaded",
            "notUploaded"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$cafUploaded",
        count: { $sum: 1 }
      }
    }
  ]);

  let cafUploaded = 0;
  let cafNotUploaded = 0;

  cafAggregation.forEach(c => {
    if (c._id === "uploaded") cafUploaded = c.count;
    if (c._id === "notUploaded") cafNotUploaded = c.count;
  });

  /* -------------------------------------------------
     3️⃣ USER COUNT BY SERVICE OPTED
  ------------------------------------------------- */
  const serviceAggregation = await User.aggregate([
    {
      $group: {
        _id: "$generalInformation.serviceOpted",
        count: { $sum: 1 }
      }
    }
  ]);

  const serviceCounts = {
    intercom: 0,
    broadband: 0,
    corporate: 0
  };

  serviceAggregation.forEach(s => {
    serviceCounts[s._id] = s.count;
  });

  
  /* -------------------------------------------------
     4️⃣ USER COUNT BY eKYC STATUS
  ------------------------------------------------- */
  const ekycAggregation = await User.aggregate([
    {
      $project: {
        ekycStatus: {
          $cond: [
            { $eq: ["$additionalInformation.ekyc", "yes"] },
            "yes",
            "no"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$ekycStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  let ekycYes = 0;
  let ekycNo = 0;

  ekycAggregation.forEach(e => {
    if (e._id === "yes") ekycYes = e.count;
    if (e._id === "no") ekycNo = e.count;
  });


  /* -------------------------------------------------
     FINAL RESPONSE
  ------------------------------------------------- */
  return successResponse(res, "Dashboard summary fetched successfully", {
    tickets: ticketCounts,
    caf: {
      uploaded: cafUploaded,
      notUploaded: cafNotUploaded
    },
    serviceOpted: serviceCounts,
      ekyc: {
      yes: ekycYes,
      no: ekycNo
    }
  });
});
