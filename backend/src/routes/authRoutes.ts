import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { ensureDb } from "../middleware/ensureDb.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.use(ensureDb);

router.post(
  "/register",
  authLimiter,
  [body("email").isEmail(), body("password").isLength({ min: 6 }), body("name").notEmpty()],
  auth.register
);
router.post("/login", authLimiter, auth.login);
router.post("/google", auth.googleAuth);
router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.post("/otp/request", auth.requestOtp);
router.post("/otp/request-email", auth.requestEmailOtp);
router.post("/otp/verify-email", auth.verifyEmailOtp);
router.get("/me", authenticate, auth.getMe);
router.patch("/me", authenticate, auth.updateProfile);
router.post("/addresses", authenticate, auth.addAddress);
router.patch("/addresses/:id", authenticate, auth.updateAddress);
router.delete("/addresses/:id", authenticate, auth.deleteAddress);

export default router;
