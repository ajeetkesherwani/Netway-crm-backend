const axios = require("axios");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { successResponse } = require("../../../utils/responseHandler");

exports.getIptvPackages = catchAsync(async (req, res, next) => {

  const apiResponse = await axios.get(
    "http://crm.ziggtv.com/partner/api/lco/plans",
    {
      data: {
        lcoCode: "L10013",
        login_id: "Netway_LCO",
        api_token: "f2b6c35a1136fb8343b68b576f68075c"
      },
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  
  console.log("ZiggTV Response:", apiResponse.data);

  if (!apiResponse.data.success || !Array.isArray(apiResponse.data.plan_list)) {
    return next(new AppError("Failed to fetch IPTV packages from third-party API", 500));
  }

  const formattedPlans = apiResponse.data.plan_list.map(plan => ({
    plan_Id: plan.plan_id,
    plan_code: plan.plan_code,
    plan_name: plan.plan_name,
    plan_type: plan.plan_type,
    plan_cat: plan.plan_cat,
    plan_period: plan.plan_period,
    customer_price: plan.customer_price,
    lco_price: plan.lco_price
  }));

  return successResponse(
    res,
    "IPTV packages fetched successfully",
    { packages: formattedPlans }
  );
});
