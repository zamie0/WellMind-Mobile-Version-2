import { Router } from "express";
import { loginCounselor, listCounselors } from "./counselor.controller.js";

const router = Router();

router.get("/", listCounselors);
router.post("/login", loginCounselor);

export default router;
