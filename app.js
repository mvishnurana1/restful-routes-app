let expressSanitizer = require("express-sanitizer"),  
    methodOverride   = require("method-override"), 
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"), 
    express          = require("express"), 
    app              = express(); 

// APP CONFIG. 
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true}); 
app.set("view engine", "ejs"); 
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(expressSanitizer());   // needs to be after body parser!!!
app.use(methodOverride("_method")); 

// Blog schema configuration
let blogSchema = new mongoose.Schema({
    title   : String, 
    image   : String, 
    body    : String, 
    created : 
        {   
            type: Date, 
            default: Date.now
        }
}); 

let blog = mongoose.model("blog", blogSchema); 

// RESTFUL ROUTES: 
app.get("/", (req, res)=>{
    res.redirect("/blogs"); 
});

app.get("/blogs", (req, res) =>{
    blog.find({}, (err, blogs)=>{
        if(err) {
            console.log("Error!"); 
        } else {
            res.render("index", {blogs: blogs}); 
        }
    }); 
}); 


// NEW ROUTE
app.get("/blogs/new", (req, res)=>{
    res.render("new"); 
}); 

// CREATE ROUTE
app.post("/blogs", (req, res)=>{
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    blog.create(req.body.blog,  (err, newBlog)=>{
        if(err) {
            res.render("new"); 
        } else {
            // then, redirect to the index. 
            res.redirect("/blogs"); 
        }
    }); 
}); 

// SHOW ROUTE
app.get("/blogs/:id", (req, res)=>{
    blog.findById(req.params.id, (err, foundBlog)=>{
        if(err) {
            res.redirect("/blogs"); 
        } else {
            res.render("show", {blog: foundBlog}); 
        }
    }); 
}); 

//EDIT ROUTE
app.get("/blogs/:id/edit", (req, res)=>{
    blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs"); 
        } else {
            res.render("edit", {blog: foundBlog}); 
        }
    }); 
}); 

app.put("/blogs/:id", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err) {
            res.redirect("/blogs"); 
        } else {
            res.redirect("/blogs/"+req.params.id); 
        }
    }); 
}); 

//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=>{
    // delete the blog and redirect somewhere else
    blog.findByIdAndRemove(req.params.id, (err)=>{
        if(err) {
            res.redirect("/blogs"); 
        } else {
            res.redirect("/blogs"); 
        }
    }); 
}); 

app.listen(3000, (req, res)=>{
    console.log("blog_app is running!"); 
}); 