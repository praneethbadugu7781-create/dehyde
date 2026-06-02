import { Router } from "express";
import * as wallet from "../controllers/walletController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", wallet.getWallet);
router.get("/max-redemption", wallet.getMaxRedemption);

export default router;
