import { connectDB } from "../config/db.js";

async function seedProducts() {
  console.log("Seeding products is disabled to prevent fake products on the live website.");
  process.exit(0);
}

seedProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
