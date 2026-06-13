import { Router } from "express";
import * as orders from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.post("/", orders.createOrder);
router.post("/verify-payment", orders.verifyPayment);
router.get("/", orders.getMyOrders);
router.get("/:id", orders.getOrderById);
router.post("/:id/cancel", orders.cancelOrder);

export default router;
