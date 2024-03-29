const express = require("express");
const {
  userById,
  allUsers,
  getUser,
  updateUser,
  deleteUser,
  userPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople,
  hasAuthorization,
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const router = express.Router();



router.put("/user/follow", requireSignin, addFollowing, addFollower);
router.put("/user/unfollow", requireSignin, removeFollowing, removeFollower);

router.get("/users", allUsers);
router.get("/user/:userId", requireSignin, getUser);
router.put("/user/:userId", requireSignin, hasAuthorization, updateUser);
router.delete("/user/:userId", requireSignin, hasAuthorization, deleteUser);

//photo
router.get("/user/photo/:userId", userPhoto);

//any route containing :userId, our app firstly execute userById
router.param("userId", userById);

//suggest follow
router.get("/user/findpeople/:userId", requireSignin, findPeople);



module.exports = router;
