import bcrypt from "bcryptjs";
import { Response } from "express";
import { User } from "../models/User.js";
import { AuthRequest } from "../middleware/auth.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { getOrCreateWallet } from "../services/walletService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function sendTokens(res: Response, user: { _id: unknown; role: string }) {
  const accessToken = signAccessToken(String(user._id), user.role);
  const refreshToken = signRefreshToken(String(user._id), user.role);
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.json({
    success: true,
    data: { accessToken, user: { id: user._id, role: user.role } },
  });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400).json({ success: false, message: "Email already registered" });
    return;
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  await getOrCreateWallet(user._id);
  sendTokens(res, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }
  sendTokens(res, user);
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, googleId, avatar } = req.body;
  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({ email, name, googleId, avatar, role: "user" });
    await getOrCreateWallet(user._id);
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (avatar) user.avatar = avatar;
    await user.save();
  }
  sendTokens(res, user);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: "Refresh token required" });
    return;
  }
  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.userId);
  if (!user) {
    res.status(401).json({ success: false, message: "User not found" });
    return;
  }
  sendTokens(res, user);
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

export const getMe = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId).select("-password -refreshToken");
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.userId,
    { name, phone },
    { new: true }
  ).select("-password");
  res.json({ success: true, data: user });
});

export const addAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  const addr = user.addresses.find((a) => String((a as any)._id) === req.params.id);
  if (!addr) {
    res.status(404).json({ success: false, message: "Address not found" });
    return;
  }
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(addr, req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  user.addresses = user.addresses.filter((a) => String((a as any)._id) !== req.params.id);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

async function sendOtpEmail(email: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Resend API Key is missing. Skipping email send.");
    return;
  }

  const sender: string = "DEHYDE <otp@dehyde.in>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: email.toLowerCase(),
        subject: "DEHYDE Verification Code",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h2 style="font-family: Georgia, serif; letter-spacing: 2px; margin: 0; color: #1a1a1a;">D E H Y D E</h2>
            </div>
            <p style="font-size: 14px; color: #333;">Your one-time verification code is:</p>
            <div style="background-color: #f9f9f9; padding: 18px; text-align: center; font-size: 26px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a; margin: 20px 0; border: 1px solid #eaeaea; border-radius: 4px;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #666; line-height: 1.5;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    const data: any = await res.json();
    if (!res.ok) {
      console.error("Resend API Error details:", data);
      // Fallback: If domain dehyde.in is not verified on Resend yet, try using default sandbox onboarding sender
      if (sender !== "DEHYDE <onboarding@resend.dev>") {
        console.log("Retrying with onboarding@resend.dev sandbox sender...");
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: "DEHYDE <onboarding@resend.dev>",
            to: email.toLowerCase(),
            subject: "DEHYDE Verification Code",
            html: `<p>Your DEHYDE verification code is <strong>${otp}</strong>.</p>`,
          }),
        });
      }
    }
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
  }
}

export const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  
  // Upsert the user with the email and store OTP. If it's a new user, they won't have a name.
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { otpHash: hash, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: true, new: true }
  );
  
  const isNewUser = !user.name; // If user has no name, we need their name during verification
  
  // Send actual email via Resend (asynchronous)
  sendOtpEmail(email, otp).catch(console.error);

  res.json({
    success: true,
    message: "OTP sent to email",
    isNewUser,
    ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
  });
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body;
  if (!email || !otp) {
    res.status(400).json({ success: false, message: "Email and OTP are required" });
    return;
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.otpHash || !user.otpExpires) {
    res.status(400).json({ success: false, message: "Invalid request or OTP expired" });
    return;
  }
  if (user.otpExpires.getTime() < Date.now()) {
    res.status(400).json({ success: false, message: "OTP expired" });
    return;
  }
  const valid = await bcrypt.compare(otp, user.otpHash);
  if (!valid) {
    res.status(400).json({ success: false, message: "Invalid OTP" });
    return;
  }
  
  // Clear OTP
  user.otpHash = undefined;
  user.otpExpires = undefined;
  
  // Set name if new user
  if (!user.name) {
    if (!name) {
      res.status(400).json({ success: false, message: "Name is required for first-time sign up" });
      return;
    }
    user.name = name;
  }
  
  await user.save();
  await getOrCreateWallet(user._id);
  sendTokens(res, user);
});

// OTP-ready: store hash, verify in future SMS integration
export const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);
  await User.findOneAndUpdate(
    { phone },
    { otpHash: hash, otpExpires: new Date(Date.now() + 10 * 60 * 1000) },
    { upsert: false }
  );
  // In production: send via SMS provider
  res.json({
    success: true,
    message: "OTP sent",
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  });
});
