import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dehyde333_db_user:imGmzzh5cn7VUkjN@cluster0.rwxlo4v.mongodb.net/dehyde?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const UserSchema = new mongoose.Schema({
      email: String,
      otpHash: String,
      otpExpires: Date,
      name: String,
    }, { collection: "users" });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const email = "test-otp-flow@dehyde.in";
    const otp = "889977";

    // 1. Simulate OTP Generation (requestEmailOtp)
    const hash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otpHash: hash, otpExpires: expires },
      { upsert: true, new: true }
    );
    console.log("Simulated OTP generation: hash saved to DB.");

    // 2. Simulate OTP Verification (verifyEmailOtp)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error("User not found!");
      return;
    }

    console.log("User record loaded:", user);

    if (user.otpExpires && user.otpExpires.getTime() < Date.now()) {
      console.error("OTP is expired!");
      return;
    }

    const valid = await bcrypt.compare(otp, user.otpHash || "");
    console.log("Bcrypt comparison result:", valid);

    if (valid) {
      console.log("OTP verification SUCCESS!");
    } else {
      console.log("OTP verification FAILED!");
    }

    // Clean up test user
    await User.deleteOne({ email: email.toLowerCase() });
    console.log("Cleaned up test user.");

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

run();
