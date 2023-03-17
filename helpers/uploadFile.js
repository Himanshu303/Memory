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

module.exports= {

 uploadFile : (req, res, next) => {
  const uploadProcess = upload.array('image');

  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
        return res.render("error-filetoolarge",{err,og_url:req.originalUrl,page:'add',layout: "layouts/boilerplate"})
     } else if (err) {
      return res.render("error-filetoolarge",{err,og_url:req.originalUrl,page:'add',layout: "layouts/boilerplate"})
     }
     next();
  });
}

,
editFile : (req, res, next) => {
  const uploadProcess = upload.array('image');
  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
        return res.render("error-filetoolarge",{err,story_id:req.params.id,req,page:'edit',id:req.body.id,layout: "layouts/boilerplate"})
     } else if (err) {
      return res.render("error-filetoolarge",{err,story_id:req.params.id,page:'edit',layout: "layouts/boilerplate"})
     }
     next();
  });
}
}
