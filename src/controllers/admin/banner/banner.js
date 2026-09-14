const Banner = require("../../../models/banner");

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { bannerName, bannerType, reseller, lco, fromDate, toDate, short, status } = req.body;
    let file = "";
    if (req.files && req.files.file && req.files.file.length > 0) {
      file = `/banner/${req.files.file[0].filename}`;
    } else if (req.body.file) {
      file = req.body.file;
    }

    const newBanner = new Banner({
      bannerName,
      bannerType,
      reseller,
      lco,
      fromDate,
      toDate,
      short,
      file,
      status
    });

    await newBanner.save();
    return res.status(201).json({ status: true, message: "Banner created successfully", data: newBanner });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get List of Banners with Search by Name and Filters
exports.getBanners = async (req, res) => {
  try {
    const { search, status, bannerType } = req.query;
    let query = { isDeleted: false };

    if (search) {
      query.bannerName = { $regex: search, $options: "i" };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (bannerType) {
      query.bannerType = bannerType;
    }

    const banners = await Banner.find(query)
      .sort({ short: 1, createdAt: -1 })
      .populate("reseller", "resellerName")
      .populate("lco", "lcoName");
    return res.status(200).json({ status: true, message: "Banners fetched successfully", data: banners });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get Single Banner
exports.getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findOne({ _id: id, isDeleted: false })
      .populate("reseller", "resellerName")
      .populate("lco", "lcoName");
    
    if (!banner) {
      return res.status(404).json({ status: false, message: "Banner not found" });
    }
    return res.status(200).json({ status: true, message: "Banner fetched successfully", data: banner });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.files && req.files.file && req.files.file.length > 0) {
      updates.file = `/banner/${req.files.file[0].filename}`;
    }

    const banner = await Banner.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ status: false, message: "Banner not found" });
    }
    return res.status(200).json({ status: true, message: "Banner updated successfully", data: banner });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Soft Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, status: "inactive" } },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ status: false, message: "Banner not found" });
    }
    return res.status(200).json({ status: true, message: "Banner deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
