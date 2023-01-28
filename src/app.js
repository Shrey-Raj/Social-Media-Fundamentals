const mongoose = require("mongoose");
const express = require("express");
const app = express();
const hbs = require("hbs");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

//Require DOM to create html elements dynamically
// const { JSDOM } = require('jsdom');
// const dom = new JSDOM();
// const document = dom.window.document;
 
app.use(express.json());

// Use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = 2000;

require("./db/conn.js");
const AllUser = require("./models/registers");

app.set("view engine", "hbs");
app.set("views", "../template/views");
hbs.registerPartials("../template/partials");

app.get("/", async (req, res) => {
  res.render("index");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/createposts", (req, res) => {
  res.render("createposts");
});
// app.get('/viewposts' , async(req,res)=>{
   
//   try { 
//     const users = await AllUser.find().exec();

//     let div = document.getElementById("myDiv");
//     let p = document.createElement("p");
//     p.innerHTML = "Hello, World!";
//     div.appendChild(p);
    

//     users.forEach(user => {
//       user.posts.forEach(post => {
//         console.log("Author: ", user.name);
//         console.log("Title: ", post.title);
//         console.log("Content: ", post.content);
//         console.log("Date: ", post.createdAt);
//         console.log("-------------------");
//       });
//     });

//     res.render("viewposts");

//   } catch (err) {
//     console.log(err);
//     res.status(500).send("An error occurred while retrieving the users.");
//   } 
//   // res.render('viewposts') ; 
// });

app.get('/viewposts' , async(req,res)=>{
  try { 
    const users = await AllUser.find().exec();

    let postData = [];             

    users.forEach(user => {
      user.posts.forEach(post => {
        postData.push({
          author: user.name,
          title: post.title,
          content: post.content,
          date: post.createdAt
        });
      });
    });
  
    res.render("viewposts", { postData });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.get('/searchuser' , async(req,res)=>{
res.render('searchuser');
});

app.post("/register", async (req, res) => {
  try {
    // console.log(Object.keys(req.body)); Prints all the keys of request object

    const username = req.body.username;
    const email = req.body.useremail;
    const pass = req.body.password;
    const conpass = req.body.confirmpassword;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    const emailExists = await AllUser.countDocuments({ email });

    if (emailExists > 0) {
      res.send(`<h1>This email already exists: ${email}</h1>`);
      return;
    }

    if (pass != conpass) {
      res.send(`<h1> Passwords Dont Match </h1>`);
      return;
    } else {
      const registerUser = new AllUser({
        name: `${username}`,
        email: `${email}`,
        password: `${hashedPassword}`,
      });
      const registered = await registerUser.save();
      res.status(201).render("congo", {
        login_mess: `Successfully Registered `,
        welcome: `${username}`.toUpperCase(),
      }); //viewposts render krwa ke waha pe "Congo message" print krwa do .
    }
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    const useremail = req.body.useremail;
    const pass = req.body.password;

    // Check if email is present in our database or not
    const emailExists = await AllUser.countDocuments({ useremail });

    if (emailExists == 0) {
      res.send(`<h1>This email does not exist . : ${useremail}</h1>`);
      return;
    }

    //----------------------------------------------------

    AllUser.findOne({ email: useremail })
      .select("password name")
      .exec(async (err, user) => {
        if (err) {
          console.log(err, "Error Here 1");
          res.status(200).send("<h1>Oops ! Some error occurred !</h1>");
          return;
        }

        if (!user) {
          console.log("User not found");
          res.status(200).send("<h1>Oops ! User not found !</h1>");
          return;
        }

        const isMatched = await bcrypt.compare(pass, user.password);

        if (isMatched == true) {
          res.status(201).render("congo", {
            login_mess: `Successfully Logged IN `,
            welcome: `${user.name}`.toUpperCase(),
          });
        } else {
          // res.write(isMatched) ;
          res
            .status(200)
            .send(
              `<h1> Wrong Credentials !! ${pass} != ${user.password} , isMAtched  = ${isMatched}</h1>`
            );
        }
      });
  } catch (err) {
    console.log(err);
    res.status(404).send(`<h1> Some Error Occured ! :(  </h1>`);
  }
});

app.post("/createposts", async (req, res) => {
  try {
    const newPost = {
      title: req.body.title,
      content: req.body.content,
      author:req.body.author
    };

    // console.log(req.body.author) ; 

    await AllUser.findOneAndUpdate(
      { name : req.body.author },
      { $push: { posts: newPost } },
      { new: true }
    ).select("name")
    .exec(async (err, user) => { 
    try
    {
        res.render("congo", {
        post_mess: "Your post was created successfully !",
        welcome: `${req.body.author}`.toUpperCase(),
      })
    }
    catch(err){ console.log(err);
     res.status(404).send("<h1>Some error occurred </h1>");
    }
  }) 
}
  catch (err) {
    console.log(err);
    res.status(404).send("<h1>Some error occurred </h1>");
  }
});         

app.post('/searchuser',async (req,res)=>{
  const username = req.body.username ; 
  try { 
    const doesExists = await AllUser.countDocuments({ name:username });

    if(doesExists == 0){
      res.render('searchuser',{notfound:'NO SUCH USER EXISTS !!'});
      return ; 
    }
    const users = await AllUser.find({name:username}).exec();
   
    let postData = [];             
   
    users.forEach(user => {
      user.posts.forEach(post => {
        postData.push({
          title: post.title,
          content: post.content,
          date: post.createdAt
        });
      });
    });
  
    res.render("searchuser", { postData , posts_of_user:`User's All Post` });
  }  catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}...`);
}); 
