const crypto = require("crypto");
const AppError = require("./AppError");

const getCipherKey = (workingKey) =>
  crypto.createHash("md5").update(workingKey).digest();

const encrypt = (plainText, workingKey) => {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    getCipherKey(workingKey),
    Buffer.alloc(16, 0)
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
      Buffer.alloc(16, 0)
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
