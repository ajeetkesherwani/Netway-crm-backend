const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const lcoSchema = new mongoose.Schema({
    title: { type: String },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "Retailer", required: true },
    role: {
        type: mongoose.Schema.Types.ObjectId, ref: "Role"
    },
    lcoName: { type: String, requied: true },
    password: { type: String, required: true },
    mobileNo: { type: Number, match: /^[0-9]{10}$/ },
    address: { type: String },
    houseNo: { type: String },
    taluka: { type: String },
    pincode: { type: String },
    district: { type: String },
    area: { type: String },
    state: { type: String, required: true },
    county: { type: String },
    subArea: { type: String },
    telephone: { type: String },
    faxNo: { type: String },
    email: { type: String },
    messengerId: { type: String },
    website: { type: String },
    dob: { type: String },
    anniversaryDate: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    lcoBalance: { type: String },
    gst: { type: String },
    panNo: { type: String },
    dashboard: { type: String, enum: ["Admin"], default: "Admin" },
    contactPersonName: { type: String },
    contactPersonNumber: { type: String },
    supportEmail: { type: String },
    supportWhatsApp: { type: String },
    lcoCode: { type: String },
    nas: { type: [String], default: [], },
    descripition: { type: String },
    status: { type: String, enum: ["active", "inActive"], default: "inActive" },
    walletBalance: { type: Number, default: 0 },
    employeeAssociation: [{
        type: {
            type: String,
            enum: ["Admin", "Manager", "Operator"],
            default: "Admin"
        },
        status: {
            type: String,
            enum: ["active", "Inactive"],
            default: "Inactive"
        },
        employeeName: { type: String },
        employeeUserName: { type: String },
        password: { type: String },
        mobile: { type: Number },
        email: { type: String }
    }]

});

// lcoSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await bcrypt.hash(this.password, 10);
// });

// lcoSchema.methods.comparePassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// Hash employeeAssociation passwords before saving
lcoSchema.pre("save", async function (next) {
    if (this.isModified("employeeAssociation")) {
        for (let emp of this.employeeAssociation) {
            if (emp.isNew || emp.isModified("password")) {
                emp.password = await bcrypt.hash(emp.password, 10);
            }
        }
    }
    next();
});

// Compare password for employeeAssociation login
lcoSchema.methods.compareEmployeePassword = async function (enteredPassword, empPassword) {
    return await bcrypt.compare(enteredPassword, empPassword);
};

const Lco = mongoose.model("Lco", lcoSchema);

module.exports = Lco;