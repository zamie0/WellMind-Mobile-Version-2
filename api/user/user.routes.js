import { Router } from "express";
import { loginUser, registerUser, updateUserPin, updateUserProfile, verifyUserPin } from "./user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/:userId/profile", updateUserProfile);
router.patch("/:userId/pin", updateUserPin);
router.post("/:userId/pin/verify", verifyUserPin);

export default router;
