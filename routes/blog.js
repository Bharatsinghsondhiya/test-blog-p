const {Router, response} = require('express');
const multer = require("multer");
const router = Router();   
const path = require("path")
const Blog = require("../models/blog")
const Comment = require("../models/comment");
const blog = require('../models/blog');
console.log(">>> routes/blog.js LOADED");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/upload/`));
  },
  filename: function (req, file, cb) {
  const fileName = `${Date.now()}-${file.originalname}`
  cb (null,fileName)
  }
})

const upload = multer({ storage: storage })

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate("CreatedBy", "fullName")   // show blog author
    .lean();

  const comments = await Comment.find({ blogid: req.params.id })
    .populate("createdBy", "fullName")   // show commenter name
    .sort({ createdAt: -1 })             // newest first
    .lean();

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});



router.post("/", upload.single("coverImage"), async(req,res)=>{
 // before: const {title, body} = req.body;
const { title: tittle, body } = req.body; // map incoming "title" -> schema "tittle"

const blog = await Blog.create({
  tittle,                                  // matches schema (required)
  body,
  CreatedBy: req.user ? req.user._id : null, // matches your schema field name
  coverImageURL: req.file ? `/upload/${req.file.filename}` : undefined
});

  return res.redirect(`/blog/${blog._id}`);
})




module.exports = router;