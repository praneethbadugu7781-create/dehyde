import { Router } from "express";
import * as products from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", products.getProducts);
router.get("/search", products.searchProducts);
router.get("/categories", products.getCategories);
router.get("/:slug", products.getProductBySlug);

router.post("/", authenticate, requireAdmin, products.createProduct);
router.patch("/:id", authenticate, requireAdmin, products.updateProduct);
router.delete("/:id", authenticate, requireAdmin, products.deleteProduct);

export default router;
