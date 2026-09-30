const { assignPlayboxPack } = require('./playboxServices');
const { assignZiggTvPack, createZiggTvUser } = require('./ziggtvServices');
const Package = require('../models/package');
const User = require('../models/user');

async function processThirdPartyPackages(userId, packageId) {
  try {
    const user = await User.findById(userId);
    const pkg = await Package.findById(packageId);

    if (!user || !pkg) return;

    // Check for PlayBoxTV (OTT)
    if (pkg.isOtt && pkg.ottType === 'playBox' && pkg.ottPackageId?.packId) {
      try {
        console.log("---- STARTING PLAYBOX USER CREATION & ASSIGNMENT ----");
        const playboxRes = await assignPlayboxPack(user, pkg.ottPackageId.packId);
        console.log("---- PLAYBOX USER CREATION SUCCESS ----");
        console.log(JSON.stringify(playboxRes, null, 2));
        console.log("----------------------------------------");
      } catch (err) {
        console.error("Failed to assign PlayBoxTV pack in background:", err.message);
      }
    }

    // Check for ZiggTV (IPTV)
    if (pkg.isIptv && pkg.iptvType === 'ziggTv' && pkg.iptvPackageId?.plan_id) {
      console.log("---- STARTING ZIGGTV USER CREATION ----");
      try {
        const ziggtvRes = await createZiggTvUser(user);
        if (ziggtvRes && ziggtvRes.subscriberCode && (!user.generalInformation.ziggtvUserId || user.generalInformation.ziggtvUserId !== ziggtvRes.subscriberCode)) {
          user.generalInformation.ziggtvUserId = ziggtvRes.subscriberCode;
          await user.save();
          console.log("Saved ZiggTV User ID:", ziggtvRes.subscriberCode);
        }
      } catch (createErr) {
        console.error("Failed to create ZiggTV user in background:", createErr.message);
      }

      console.log("---- STARTING ZIGGTV PACKAGE ASSIGNMENT ----");
      let monthStr = "1";
      if (pkg.validity && pkg.validity.number) {
        if (pkg.validity.unit?.toLowerCase() === "month") {
          monthStr = String(pkg.validity.number);
        } else if (pkg.validity.unit?.toLowerCase() === "day") {
          monthStr = Math.max(1, Math.round(Number(pkg.validity.number) / 30)).toString();
        } else if (pkg.validity.unit?.toLowerCase() === "year") {
          monthStr = String(Number(pkg.validity.number) * 12);
        }
      }
      
      // Strictly enforce month is between 1 and 12 for ZiggTV API
      let m = parseInt(monthStr, 10);
      if (isNaN(m) || m < 1) m = 1;
      if (m > 12) m = 12;
      monthStr = String(m);

      try {
        const assignRes = await assignZiggTvPack(user, pkg.iptvPackageId.plan_id, monthStr);
        console.log("---- ZIGGTV PACKAGE ASSIGN SUCCESS ----");
        console.log(JSON.stringify(assignRes, null, 2));
        console.log("----------------------------------------");
      } catch (err) {
        console.error("Failed to assign ZiggTV pack in background:", err.message);
      }
    }

  } catch (err) {
    console.error("Error processing third party packages:", err);
  }
}

module.exports = {
  processThirdPartyPackages
};
