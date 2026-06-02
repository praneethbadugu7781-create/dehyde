import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import * as products from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/dashboard", admin.getDashboard);
router.get("/orders", admin.getAllOrders);
router.patch("/orders/:id", admin.updateOrderStatus);
router.get("/customers", admin.getCustomers);
router.get("/coupons", admin.manageCoupons);
router.post("/coupons", admin.manageCoupons);
router.get("/banners", admin.manageBanners);
router.post("/banners", admin.createBanner);
router.patch("/banners/:id", admin.updateBanner);
router.delete("/banners/:id", admin.deleteBanner);
router.patch("/change-password", admin.changePassword);
router.patch("/settings", admin.updateSettings);
router.post("/wallet/adjust", admin.adjustWallet);
router.get("/products", products.getProducts);
router.post("/products", products.createProduct);
router.patch("/products/:id", products.updateProduct);

export default router;
