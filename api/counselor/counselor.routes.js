import { Router } from "express";
import {
  loginCounselor,
  listCounselors,
  updateCounselorPin,
  verifyCounselorPin,
} from "./counselor.controller.js";

const router = Router();

router.get("/", listCounselors);
router.post("/login", loginCounselor);
router.patch("/:counselorId/pin", updateCounselorPin);
router.post("/:counselorId/pin/verify", verifyCounselorPin);

export default router;
