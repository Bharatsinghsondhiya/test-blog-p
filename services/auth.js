// services/auth.js
const JWT = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "hello@secret09";

function createTokenForUser(user){
  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,          // include fullName so views can show it
    profileImageURL: user.profileImageURL,
    role: user.role,
  };
  return JWT.sign(payload, secret, { expiresIn: "7d" });
}

function validateToken(token){
  // Will throw if token invalid or expired
  return JWT.verify(token, secret);
}

module.exports = {
  createTokenForUser,
  validateToken,
};
