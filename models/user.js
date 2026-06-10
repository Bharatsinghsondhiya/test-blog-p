const { createHmac, randomBytes } = require('node:crypto');


const { createTokenForUser,
    validateToken, } =
    require("../services/auth")

const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    // for hashing purpuse 
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        unique: true
    },

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




userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    // Use a hex salt for consistency
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

// Provide a statics method to check credentials
userSchema.static("matchPasswordAndGenrateToken", async function (email, password) {

    const user = await this.findOne({ email });

    if (!user) throw new Error('User not found');

    const salt = user.salt;
    const storedHashed = user.password;

    // Hash the provided password with the stored salt
    const providedHashed = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    if (storedHashed !== providedHashed)
        throw new Error('Password does not match');

    const token = createTokenForUser(user)
    return token;


});
module.exports = model('User', userSchema); // export via model() from destructured model