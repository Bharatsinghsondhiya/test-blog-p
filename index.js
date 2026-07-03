const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const cookieParser = require("cookie-parser")
const Blog = require("./models/blog")

const userRouter = require("./routes/user");
const BlogRoute = require("./routes/blog")

const { checkforAuthenticationCookie } = require("./middlwares/auth");
const { error } = require("console");

// index.js — near the top, after app = express()


const app = express();
const PORT = 4000;

mongoose.connect("mongodb://localhost:27017/blogify").then(()=>{
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB Connection Error:", err));



app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});
app.use(express.urlencoded({extended:false}));
app.use(cookieParser())
app.use(checkforAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')))
app.get("/", async(req,res)=>{

const allBlogs = await Blog.find({}).populate('CreatedBy', 'fullName').sort({ createdAt: -1 });
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    })
})



app.use("/user",userRouter);

app.use("/blog",BlogRoute);




app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})