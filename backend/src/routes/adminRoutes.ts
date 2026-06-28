import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import * as products from "../controllers/productController.js";
import * as feedback from "../controllers/feedbackController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/dashboard", admin.getDashboard);
router.get("/orders/export", admin.exportOrders);
router.get("/orders", admin.getAllOrders);
router.patch("/orders/:id", admin.updateOrderStatus);
router.get("/customers", admin.getCustomers);
router.get("/coupons", admin.manageCoupons);
router.post("/coupons", admin.manageCoupons);
router.patch("/coupons/:id", admin.updateCoupon);
router.delete("/coupons/:id", admin.deleteCoupon);
router.get("/offers", admin.manageOffers);
router.post("/offers", admin.manageOffers);
router.patch("/offers/:id", admin.updateOffer);
router.delete("/offers/:id", admin.deleteOffer);
router.get("/banners", admin.manageBanners);
router.post("/banners", admin.createBanner);
router.patch("/banners/:id", admin.updateBanner);
router.delete("/banners/:id", admin.deleteBanner);
router.patch("/change-password", admin.changePassword);
router.get("/settings", admin.getSettings);
router.patch("/settings", admin.updateSettings);
router.post("/wallet/adjust", admin.adjustWallet);
router.get("/products", products.getProducts);
router.post("/products", products.createProduct);
router.patch("/products/:id", products.updateProduct);

// Suggestions & Feedback
router.get("/feedback", feedback.getAllFeedback);
router.delete("/feedback/:id", feedback.deleteFeedback);
router.patch("/feedback/:id", feedback.updateFeedbackStatus);

export default router;

