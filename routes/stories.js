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
} = require("../helpers/ejs");


// @desc Show add page
// @route GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add", { layout: "layouts/boilerplate" });
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
    console.log(err);
    res.render("404error", { err, layout: "layouts/boilerplate" });
  }
});




// @desc Process the add form
// @route Post /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    console.log(req.body);
    await Story.create(req.body);
    res.redirect("/dashboard");
  
  } catch (err) {
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


    res.render("stories/index", {
      stories,
      layout: "layouts/boilerplate",
      truncate,
      stripTags,
      editIcon,
    });

  } catch (err) {
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


    }else {

      return res.render("stories/edit", {
        story,
        statusList,
        layout: "layouts/boilerplate",
      });

    }
  } 
  
  catch (err) {
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});




// @desc Process the edited form
// @route PUT /stories/edit/:id
router.put("/edit/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.render("404error", { layout: "layouts/boilerplate" });
    }
    if (req.user.id != story.user) {
      return res.redirect("/stories");
    } else {
      story = await Story.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );
      console.log("successfull");
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});




//@desc Delete the specific story
//@route DELETE /stories/id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (err) {
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

    res.render("stories/index", {
      stories,
      truncate,
      stripTags,
      editIcon,
      layout: "layouts/boilerplate",
    });
  } catch (err) {
    console.log(err);
    res.render("error", { err, layout: "layouts/boilerplate" });
  }
});




module.exports=router