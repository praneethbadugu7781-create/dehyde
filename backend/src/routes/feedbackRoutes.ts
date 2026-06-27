import { Router } from "express";
import * as feedbackController from "../controllers/feedbackController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", optionalAuth, feedbackController.createFeedback);
router.get("/approved", feedbackController.getApprovedFeedback);

export default router;
