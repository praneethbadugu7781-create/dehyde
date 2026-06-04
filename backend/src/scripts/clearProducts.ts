import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";

async function clearProducts() {
  await connectDB();
  console.log("Deleting all products from DB...");
  const result = await Product.deleteMany({});
  console.log(`Deleted ${result.deletedCount} products.`);
  process.exit(0);
}

clearProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
