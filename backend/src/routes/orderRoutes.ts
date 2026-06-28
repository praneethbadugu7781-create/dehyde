import { Router } from "express";
import * as orders from "../controllers/orderController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/calculate", optionalAuth, orders.calculateOrderSummary);

router.use(authenticate);
router.post("/", orders.createOrder);
router.post("/verify-payment", orders.verifyPayment);
router.get("/", orders.getMyOrders);
router.get("/:id", orders.getOrderById);
router.post("/:id/cancel", orders.cancelOrder);

export default router;
