const multer=require("multer");

const {storage, cloudinary}=require("../config/cloudinary");

const upload=multer({storage,
  fileFilter: function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
   return cb(new Error('Only images of type jpg, jpeg, or png are allowed'));
  }
  return cb(null, true);
},
limits: { fileSize: 2000000 }
})

module.exports= {

 uploadFile : (req, res, next) => {
  const uploadProcess = upload.array('image');

  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
         req.flash("error","Only images of type jpg, jpeg, or png are allowed with size < 2MB");
         return res.redirect("/stories/add");
     } else if (err) {
      req.flash("error","Only images of type jpg, jpeg, or png are allowed with size < 2MB");
      return res.redirect("/stories/add");
     }
     next();
  });
}

,
editFile : (req, res, next) => {
  const uploadProcess = upload.array('image');
 
  uploadProcess(req, res, err => {
     if (err instanceof multer.MulterError) {
       req.flash("error","Only images of type jpg, jpeg, or png are allowed with size < 2MB");
       return res.redirect(`/stories/edit/${req.params.id}`)
     } else if (err) {
      req.flash("error","Only images of type jpg, jpeg, or png are allowed with size < 2MB");
   return  res.redirect(`/stories/edit/${req.params.id}`)
   }
     next();
  });
}
}
