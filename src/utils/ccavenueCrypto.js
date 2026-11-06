const crypto = require("crypto");
const AppError = require("./AppError");

// CCAvenue standard 16-byte initialization vector (0x00 to 0x0f)
const CCAVENUE_IV = Buffer.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  0x0c, 0x0d, 0x0e, 0x0f,
]);

const getCipherKey = (workingKey) =>
  crypto.createHash("md5").update(workingKey).digest();

const encrypt = (plainText, workingKey) => {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    getCipherKey(workingKey),
    CCAVENUE_IV
  );
  return Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]).toString("hex");
};

const decrypt = (encryptedText, workingKey) => {
  if (!/^(?:[0-9a-f]{32})+$/i.test(encryptedText)) {
    throw new AppError("Invalid CCAvenue payment response", 400);
  }

  try {
    const decipher = crypto.createDecipheriv(
      "aes-128-cbc",
      getCipherKey(workingKey),
      CCAVENUE_IV
    );
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "hex")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new AppError("Unable to decrypt CCAvenue payment response", 400);
  }
};

module.exports = { encrypt, decrypt };
