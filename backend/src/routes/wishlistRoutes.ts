import { Router } from "express";
import * as wishlist from "../controllers/wishlistController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);
router.get("/", wishlist.getWishlist);
router.post("/toggle", wishlist.toggleWishlist);

export default router;
