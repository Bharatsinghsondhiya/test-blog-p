const {Router, response} = require('express');
const multer = require("multer");
const router = Router();   
const path = require("path")
const Blog = require("../models/blog")
const Comment = require("../models/comment");
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

// Important: Specific routes must come before parameterized routes (/:id)
router.get("/add-new", (req, res) => {
  return res.render("addblog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("CreatedBy", "fullName")   // show blog author
      .lean();

    if (!blog) return res.status(404).send("Blog not found");

    const comments = await Comment.find({ blogid: req.params.id })
      .populate("createdBy", "fullName")   // show commenter name
      .sort({ createdAt: -1 })             // newest first
      .lean();

    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    return res.status(500).send("Server Error");
  }
});



router.post("/", upload.single("coverImage"), async(req,res)=>{
  try {
    const { title: tittle, body } = req.body; // map incoming "title" -> schema "tittle"

    const blog = await Blog.create({
      tittle,                                  // matches schema (required)
      body,
      CreatedBy: req.user ? req.user._id : null, // matches your schema field name
      coverImageURL: req.file ? `/upload/${req.file.filename}` : undefined
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    return res.status(500).send("Error creating blog");
  }
})

// Route for posting comments
router.post("/comment/:blogId", async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/user/signin"); // must be logged in
    }
    await Comment.create({
      content: req.body.content,
      blogid: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error posting comment");
  }
});

module.exports = router;