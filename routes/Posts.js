const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");
const { validateToken } = require("../middleware/AuthMiddleware");
const multer = require('multer'); 


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads"); // Ensure the correct path to your uploads directory
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  onError: function(err, next) {
    console.error("Multer error:", err);
    next(err);
  }
});

const path = require('path');

router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  res.json(post);
});

router.get("/", validateToken, async (req, res) => {
  try {
    const listOfPosts = await Posts.findAll({ include: [Likes] });
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });

    // Map through the list of posts to include the image URL
    const postsWithImageURLs = listOfPosts.map(post => ({
      ...post.toJSON(),
      imageUrl: post.getImageUrl() // Assuming there's a method to get the image URL in your model
    }));

    res.json({ listOfPosts: postsWithImageURLs, likedPosts: likedPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Other routes...

router.post("/", validateToken, upload.single("file"), async (req, res) => {
  try {
    // Access uploaded file data from req.file
    const { filename } = req.file;

    // Access other form data from req.body
    const { title, postText } = req.body;

    // Create the post object
    const post = {
      title,
      postText,
      username: req.user.username,
      UserId: req.user.id,
      file: filename // Assign the filename to the post object
    };

    // Log the post object to see its contents
    console.log(post);

    // Assuming Posts is your Sequelize model for posts
    const createdPost = await Posts.create(post);

    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id;
  const listOfPosts = await Posts.findAll({
    where: { UserId: id },
    include: [Likes],
  });
  res.json(listOfPosts);
});


router.put("/title", validateToken, async (req, res) => {
  const { newTitle, id } = req.body;
  await Posts.update({ title: newTitle }, { where: { id: id } });
  res.json(newTitle);
});

router.put("/postText", validateToken, async (req, res) => {
  const { newText, id } = req.body;
  await Posts.update({ postText: newText }, { where: { id: id } });
  res.json(newText);
});

router.delete("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  await Posts.destroy({
    where: {
      id: postId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});

// Other routes...

module.exports = router;
