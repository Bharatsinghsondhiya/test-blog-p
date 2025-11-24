// const { createHmac, randomBytes } = require('node:crypto');


// const {createTokenForUser,
//     validateToken,} = 
// require("../services/auth")

// const { Schema, model } = require('mongoose');

// const userSchema = new Schema({
//     fullName: {
//         type: String,
//         required: true
//     },

//     email: {
//         type: String,
//         required: true,
//         unique: true
//     },

//     // for hashing purpuse 
//     salt: {
//         type: String,
//     },
//     password: {
//         type: String,
//         required: true,
//         unique: true
//     },

//     profileImageURL: {
//         type: String,
//         default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png"
//     },

//     role: {
//         type: String,
//         enum: ["USER", "Admin"],
//         default: "USER"
//     }



// }, { timestamps: true });


// //this middleware will hash password before saving user
// //in database it is pre hook
// //it will run before saving user and 

// userSchema.pre('save', function (next) {
//     const user = this;
//     if (!user.isModified('password')) return next();

//     // Use a hex salt for consistency
//     const salt = randomBytes(16).toString('hex');
//     const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

//     this.salt = salt;
//     this.password = hashedPassword;

//     next();
// });

// // Provide a statics method to check credentials
// userSchema.static("matchPasswordAndGenrateToken", async function (email, password) {

//     const user = await this.findOne({ email });

//     if (!user) throw new Error('User not found');

//     const salt = user.salt;
//     const storedHashed = user.password;

//     // Hash the provided password with the stored salt
//     const providedHashed = createHmac('sha256', salt)
//     .update(password)
//     .digest('hex');

//     if (storedHashed !== providedHashed)
//      throw new Error('Password does not match');

//     // Return a safe plain object without sensitive fields
//     // const obj = user.toObject ? user.toObject() : { ...user};
//     // obj.password = undefined;
//     // obj.salt = undefined;

//     // return obj;

//     const token = createTokenForUser(user)
// return token;


// });
// const User = model("USER", userSchema);

// module.exports = User;

const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require('../services/auth');
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  salt:     { type: String },
  password: { type: String, required: true }, // removed unique: true
  profileImageURL: {
    type: String,
    default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-High-Quality-Image.png"
  },
  role: {
    type: String,
    enum: ["USER", "Admin"],
    default: "USER"
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  const salt = randomBytes(16).toString('hex');
  const hashedPassword = createHmac('sha256', salt).update(this.password).digest('hex');

  this.salt = salt;
  this.password = hashedPassword;
  next();
});

// Static method to check password and generate token
// Use `.statics` (plural)
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error('User not found');

  const salt = user.salt;
  const storedHashed = user.password;

  const providedHashed = createHmac('sha256', salt).update(password).digest('hex');

  if (storedHashed !== providedHashed) throw new Error('Password does not match');

  // build a small safe payload
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    profileImageURL: user.profileImageURL
  };

  const token = createTokenForUser(payload);
  return token;
};

const User = model('USER', userSchema);
module.exports = User;
