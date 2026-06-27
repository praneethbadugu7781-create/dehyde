import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import bcrypt from "bcryptjs";
import os from "os";

const hashToCrack = "$2a$10$/tlM9q03H0B..V.aNwsMrOICOcZ1GjJlH.zgO/oT396Ijhsiq13wu";

if (isMainThread) {
  const numCPUs = os.cpus().length;
  console.log(`Starting OTP cracking with ${numCPUs} threads...`);

  const min = 100000;
  const max = 999999;
  const totalRange = max - min + 1;
  const rangePerWorker = Math.floor(totalRange / numCPUs);

  let workersFinished = 0;
  let found = false;
  const startTime = Date.now();

  for (let i = 0; i < numCPUs; i++) {
    const start = min + i * rangePerWorker;
    const end = i === numCPUs - 1 ? max : start + rangePerWorker - 1;

    const worker = new Worker(new URL(import.meta.url), {
      workerData: { start, end, hash: hashToCrack },
    });

    worker.on("message", (msg) => {
      if (msg.success) {
        found = true;
        console.log(`\n[SUCCESS] Found matching OTP: ${msg.otp}`);
        console.log(`Time taken: ${(Date.now() - startTime) / 1000} seconds`);
        process.exit(0);
      }
    });

    worker.on("exit", () => {
      workersFinished++;
      if (workersFinished === numCPUs && !found) {
        console.log("\n[FAILED] OTP not found in range.");
        console.log(`Time taken: ${(Date.now() - startTime) / 1000} seconds`);
      }
    });
  }
} else {
  const { start, end, hash } = workerData;
  // Progress logging
  let checked = 0;
  const total = end - start + 1;

  for (let otp = start; otp <= end; otp++) {
    const otpStr = otp.toString();
    const match = bcrypt.compareSync(otpStr, hash);
    if (match) {
      parentPort?.postMessage({ success: true, otp: otpStr });
      break;
    }
    checked++;
    if (checked % 5000 === 0) {
      // Periodic check-in
      if (process.env.DEBUG) {
        console.log(`Thread [${start}-${end}] checked ${checked}/${total}`);
      }
    }
  }
  process.exit(0);
}
