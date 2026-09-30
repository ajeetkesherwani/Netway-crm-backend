const { assignPlayboxPack } = require('./playboxServices');
const { assignZiggTvPack } = require('./ziggtvServices');
const Package = require('../models/package');
const User = require('../models/user');

async function processThirdPartyPackages(userId, packageId) {
  try {
    const user = await User.findById(userId);
    const pkg = await Package.findById(packageId);

    if (!user || !pkg) return;

    // Check for PlayBoxTV (OTT)
    if (pkg.isOtt && pkg.ottType === 'playBox' && pkg.ottPackageId?.packId) {
      console.log("[ThirdParty] Assigning PlayBoxTV pack", pkg.ottPackageId.packId);
      assignPlayboxPack(user, pkg.ottPackageId.packId).catch(err => {
        console.error("Failed to assign PlayBoxTV pack in background:", err.message);
      });
    }

    // Check for ZiggTV (IPTV)
    if (pkg.isIptv && pkg.iptvType === 'ziggTv' && pkg.iptvPackageId?.plan_id) {
      console.log("[ThirdParty] Assigning ZiggTV pack", pkg.iptvPackageId.plan_id);
      assignZiggTvPack(user, pkg.iptvPackageId.plan_id).catch(err => {
        console.error("Failed to assign ZiggTV pack in background:", err.message);
      });
    }

  } catch (err) {
    console.error("Error processing third party packages:", err);
  }
}

module.exports = {
  processThirdPartyPackages
};
