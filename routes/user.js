const {Router} = require('express');
const User = require('../models/user');
const router = Router();    
const {createTokenForUser,
    validateToken,} = require("../services/auth")

router.get("/signin",(req,res)=>{
return res.render("signin");
})



router.get("/signup",(req,res)=>{
return res.render("signup");
})


router.post("/signup", async(req,res)=>{
    //we will get data from req body by using destructuring

 const {fullName, email,password} = req.body;

 await User.create({
    fullName,
    email,
    password
 })
 return res.redirect("/");
})

// router.post('/signin', async (req, res) => {
// const { email, password } = req.body;
//    console.log(email, password);
//  try {
//  const token = await User.matchPasswordAndGenrateToken(email, password);
//       return res.cookie("token",token).redirect('/');
//  } catch (error) {
//    return res.render("signin",{
//       error : "incorrect email or password"
//    })
//  }
  
// });

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  console.log('signin attempt ->', email, password);

  try {
    // calling the correctly spelled static
    const token = await User.matchPasswordAndGenerateToken(email, password);
    console.log('token created length:', token && token.length);
    return res.cookie('token', token, { httpOnly: true }).redirect('/');
  } catch (error) {
    console.log('signin failed:', error && error.message);
    return res.render('signin', {
      error: 'incorrect email or password'
    });
  }
});



module.exports = router;
