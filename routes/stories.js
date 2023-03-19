const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

const {
  truncate,
  stripTags,
  editIcon,
  statusList,
  formatDate,
  escapeRegExp,
} = require("../helpers/ejs");

const multer=require("multer");

const {storage, cloudinary}=require("../config/cloudinary");

const upload=multer({storage,
  fileFilter: function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only images of type jpg, jpeg, or png are allowed'));
  }
  cb(null, true);
},
limits: { fileSize: 2000000 }
})

const {uploadFile,editFile}=require("../helpers/uploadFile");


// @desc Show add page
// @route GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add", { layout: "layouts/boilerplate" });
});



router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (query.trim() === "") {
    res.redirect("/stories");
  } else {
    try {
      const stories = await Story.find({
        $and: [
          {
            $or: [
              { title: { $regex: escapeRegExp(query), $options: "i" } }, // search for query in title field using regex and case-insensitive matching
              { body: { $regex: escapeRegExp(query), $options: "i" } },
            ],
          },
          {
            status: "Public",
          },
        ],
      })
        .populate("user")
        .sort({ createdAt: "desc" });
      
      const isSearchEnabled = true;
      res.render("stories/index", {
        stories,
        query,
        isSearchEnabled,
        layout: "layouts/boilerplate",
        truncate,
        stripTags,
        editIcon,
      });
    } catch (err) {
      req.flash("error",err.msg);
      console.log(err);
      res.render("error", { err, layout: "layouts/boilerplate" });
    }
  }
});

// @desc Show single story
// @route GET /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user");

    if (!story) {
      return res.render("404error", { layout: "layouts/boilerplate" });
    }

    res.render("stories/show", {
      story,
      stripTags,
      editIcon,
      formatDate,
      layout: "layouts/boilerplate",
    });
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("404error", { err, layout: "layouts/boilerplate" });
  }
});

//@desc Process the add form
// @route Post /stories
router.post("/", ensureAuth, uploadFile, async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.images=req.files.map(f=>({url:f.path, fileName:f.filename}));
    const story=new Story(req.body);
    await story.save();
    req.flash("success","Story added successfully");
    res.redirect("/dashboard");
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});



// @desc Show all stories
// @route GET /stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" });
    const isSearchEnabled = false;

    res.render("stories/index", {
      stories,
      isSearchEnabled,
      layout: "layouts/boilerplate",
      truncate,
      stripTags,
      editIcon,
    });
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

// @desc Show Edit story page
// @route GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });

    if (!story) {
      return res.render("404error", { layout: "layouts/boilerplate" });
    }

    if (req.user.id != story.user) {
      return res.redirect("/stories");
    } else {


      return res.render("stories/edit", {
        story,
        statusList,
        layout: "layouts/boilerplate",
      });
    }
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

// @desc Process the edited form
// @route PUT /stories/:id
router.put("/:id", ensureAuth, editFile,async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.render("404error", { layout: "layouts/boilerplate" });
    }
    if (req.user.id != story.user) {
      return res.redirect("/stories");
    } else {
      if(req.body.deleteImages)
      {
        for(let fileName of req.body.deleteImages){
          await cloudinary.uploader.destroy(fileName);
        }
        await story.updateOne({$pull:{images:{fileName:{$in:req.body.deleteImages}}}});
    
      }

    
      story = await Story.findByIdAndUpdate({ _id: req.params.id }, req.body, {

        runValidators: true,
      });
      const imgs=req.files.map(f=>({url:f.path, fileName:f.filename}));
      story.images.push(...imgs);
      await story.save();
      req.flash("success","Story edited successfully");
      res.redirect("/dashboard");
    }
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

//@desc Delete the specific story
//@route DELETE /stories/id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);
    if (!story) {
      return res.render("404error", { layout: "layouts/boilerplate" });
    }

   
    for(let file of story.images){
      await cloudinary.uploader.destroy(file.fileName);
    }

    await Story.deleteOne({ _id: req.params.id });
    req.flash("success","Story deleted successfully");
    res.redirect("/dashboard");
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

//@desc User Stories
//@route GET /stories/user/:userId
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "Public",
    }).populate("user");

    const isSearchEnabled = false;

    res.render("stories/index", {
      stories,
      truncate,
      isSearchEnabled,
      stripTags,
      editIcon,
      layout: "layouts/boilerplate",
    });
  } catch (err) {
    req.flash("error",err.msg);
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});

module.exports = router;
