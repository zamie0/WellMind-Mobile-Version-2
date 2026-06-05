import { Router } from "express";
import { listPeers, getPeerById, searchPeers } from "./counselor.controller.js";
import { seedPeersAPI } from "../utils/seedPeers.js";

const router = Router();

router.post("/seed", seedPeersAPI);
router.get("/search", searchPeers);
router.get("/", listPeers);
router.get("/:peerId", getPeerById);

export default router;
