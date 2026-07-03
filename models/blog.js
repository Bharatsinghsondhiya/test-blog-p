const { Schema, model } = require('mongoose');


const blogSchema = new Schema({

    // Title of the blog post
    tittle : {
        type : String,
        required : true,
    },
    body:{
        type:String,
        required : true,
    },
    coverImageURL:{
        type : String,    
    },
    CreatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

} ,{timestamps: true})


// const Blog  = model("blog",blogSchema);

module.exports = model('Blog', blogSchema); // export as 'Blog' (consistent casing)
