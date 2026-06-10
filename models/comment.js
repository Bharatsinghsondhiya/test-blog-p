const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },

  blogId: { 
    type: Schema.Types.ObjectId,
    ref: "Blog",   // your Blog model name is "Blog", NOT "blog"
    required: true
  },

  CreatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = model("Comment", commentSchema);
