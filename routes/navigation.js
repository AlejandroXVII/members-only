var express = require("express");
var router = express.Router();
const user_controller = require("../controllers/userController");

router.get("/join-to-members", user_controller.user_join_members_get);

router.post("/join-to-members", user_controller.user_join_members_post);

router.get("/create-new-message", user_controller.user_create_message_get);

router.post("/create-new-message", user_controller.user_create_message_post);

router.get("/:id", user_controller.user_profile);

module.exports = router;
