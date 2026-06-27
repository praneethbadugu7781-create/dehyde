import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
console.log("Resend API Key:", apiKey);

async function testSend() {
  if (!apiKey) {
    console.error("No API key found!");
    return;
  }

  const email = "praneethbadugu30@gmail.com";
  const otp = "123456";
  const sender = "DEHYDE <otp@dehyde.in>";

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
        subject: "DEHYDE Verification Code (Test)",
        html: `<p>Your test code is <strong>${otp}</strong>.</p>`,
      }),
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response data:", data);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

testSend();
