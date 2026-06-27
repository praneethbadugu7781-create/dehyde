import mongoose from "mongoose";
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

    // Prevent compile error if model already exists
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const email = "praneethbadugu30@gmail.com";
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User record found:", user);

    const allUsers = await User.find({ email: /praneeth/i });
    console.log("All matching users:", allUsers);

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

run();
