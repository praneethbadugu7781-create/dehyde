import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Mappings of the first 2 digits of the pincode to State name, representative city
const PINCODE_MAP: Record<string, { state: string; city: string }> = {
  "11": { state: "Delhi", city: "New Delhi" },
  "12": { state: "Haryana", city: "Faridabad" },
  "13": { state: "Haryana", city: "Panchkula" },
  "14": { state: "Punjab", city: "Ludhiana" },
  "15": { state: "Punjab", city: "Bathinda" },
  "16": { state: "Chandigarh", city: "Chandigarh" },
  "17": { state: "Himachal Pradesh", city: "Shimla" },
  "18": { state: "Jammu & Kashmir", city: "Jammu" },
  "19": { state: "Jammu & Kashmir", city: "Srinagar" },
  "20": { state: "Uttar Pradesh", city: "Ghaziabad" },
  "21": { state: "Uttar Pradesh", city: "Kanpur" },
  "22": { state: "Uttar Pradesh", city: "Lucknow" },
  "23": { state: "Uttar Pradesh", city: "Allahabad" },
  "24": { state: "Uttar Pradesh", city: "Bareilly" },
  "25": { state: "Uttar Pradesh", city: "Meerut" },
  "26": { state: "Uttarakhand", city: "Dehradun" },
  "27": { state: "Uttar Pradesh", city: "Gorakhpur" },
  "28": { state: "Uttar Pradesh", city: "Jhansi" },
  "30": { state: "Rajasthan", city: "Jaipur" },
  "31": { state: "Rajasthan", city: "Udaipur" },
  "32": { state: "Rajasthan", city: "Kota" },
  "33": { state: "Rajasthan", city: "Jodhpur" },
  "34": { state: "Rajasthan", city: "Bikaner" },
  "36": { state: "Gujarat", city: "Ahmedabad" },
  "37": { state: "Gujarat", city: "Rajkot" },
  "38": { state: "Gujarat", city: "Surat" },
  "39": { state: "Gujarat", city: "Vadodara" },
  "40": { state: "Maharashtra", city: "Mumbai" },
  "41": { state: "Maharashtra", city: "Pune" },
  "42": { state: "Maharashtra", city: "Aurangabad" },
  "43": { state: "Maharashtra", city: "Kolhapur" },
  "44": { state: "Maharashtra", city: "Nagpur" },
  "45": { state: "Madhya Pradesh", city: "Indore" },
  "46": { state: "Madhya Pradesh", city: "Bhopal" },
  "47": { state: "Madhya Pradesh", city: "Gwalior" },
  "48": { state: "Madhya Pradesh", city: "Jabalpur" },
  "49": { state: "Chhattisgarh", city: "Raipur" },
  "50": { state: "Telangana", city: "Hyderabad" },
  "51": { state: "Andhra Pradesh", city: "Guntur" },
  "52": { state: "Andhra Pradesh", city: "Visakhapatnam" },
  "53": { state: "Andhra Pradesh", city: "Vijayawada" },
  "56": { state: "Karnataka", city: "Bengaluru" },
  "57": { state: "Karnataka", city: "Mysuru" },
  "58": { state: "Karnataka", city: "Hubli" },
  "59": { state: "Karnataka", city: "Belagavi" },
  "60": { state: "Tamil Nadu", city: "Chennai" },
  "61": { state: "Tamil Nadu", city: "Madurai" },
  "62": { state: "Tamil Nadu", city: "Coimbatore" },
  "63": { state: "Tamil Nadu", city: "Trichy" },
  "64": { state: "Tamil Nadu", city: "Salem" },
  "67": { state: "Kerala", city: "Kochi" },
  "68": { state: "Kerala", city: "Trivandrum" },
  "69": { state: "Kerala", city: "Kozhikode" },
  "70": { state: "West Bengal", city: "Kolkata" },
  "71": { state: "West Bengal", city: "Siliguri" },
  "72": { state: "West Bengal", city: "Durgapur" },
  "73": { state: "West Bengal", city: "Kharagpur" },
  "74": { state: "West Bengal", city: "Howrah" },
  "75": { state: "Odisha", city: "Bhubaneswar" },
  "76": { state: "Odisha", city: "Cuttack" },
  "77": { state: "Odisha", city: "Rourkela" },
  "78": { state: "Assam", city: "Guwahati" },
  "79": { state: "Meghalaya", city: "Shillong" },
  "80": { state: "Bihar", city: "Patna" },
  "81": { state: "Bihar", city: "Muzaffarpur" },
  "82": { state: "Bihar", city: "Bhagalpur" },
  "83": { state: "Jharkhand", city: "Ranchi" },
  "84": { state: "Jharkhand", city: "Jamshedpur" },
  "85": { state: "Jharkhand", city: "Dhanbad" }
};

function getPincodeDetails(pincode: string) {
  const prefix2 = pincode.substring(0, 2);
  const prefix1 = pincode.substring(0, 1);
  return PINCODE_MAP[prefix2] || PINCODE_MAP[prefix1 + "0"] || { state: "India", city: "Domestic Circle" };
}

// Get non-sensitive public settings
router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const settings = await Settings.findOne({ key: "global" });
    if (!settings) {
      res.status(404).json({ success: false, message: "Settings not found" });
      return;
    }
    
    res.json({
      success: true,
      data: {
        rewardsEnabled: settings.rewardsEnabled,
        freeShippingThreshold: settings.freeShippingThreshold,
        defaultShippingFee: settings.defaultShippingFee,
        expressShippingFee: settings.expressShippingFee,
      }
    });
  })
);

// Estimate shipping details based on postal circle/regions
router.post(
  "/estimate",
  asyncHandler(async (req, res) => {
    const { pincode, subtotal = 0 } = req.body;
    
    if (!pincode || typeof pincode !== "string" || !/^\d{6}$/.test(pincode)) {
      res.status(400).json({ success: false, message: "A valid 6-digit numeric pincode is required" });
      return;
    }
    
    const settings = await Settings.findOne({ key: "global" });
    if (!settings) {
      res.status(500).json({ success: false, message: "Store settings configuration missing" });
      return;
    }
    
    const dest = getPincodeDetails(pincode);
    const regionDigit = pincode[0];
    
    // Estimate transit times directly by region digit
    let standardDays = 3;
    let expressDays = 2;
    let courier = "Delhivery";
    let isExpressAvailable = true;
    let isCodAvailable = true;
    
    if (regionDigit === "5" || regionDigit === "6") {
      // South India: Fast transit
      standardDays = 2;
      expressDays = 1;
      courier = "Blue Dart Standard";
    } else if (regionDigit === "3" || regionDigit === "4") {
      // West / Central India
      standardDays = 3;
      expressDays = 2;
      courier = "Delhivery";
    } else if (regionDigit === "1" || regionDigit === "2") {
      // North India
      standardDays = 4;
      expressDays = 2;
      courier = "Delhivery";
    } else if (regionDigit === "7" || regionDigit === "8") {
      // East India
      standardDays = 5;
      expressDays = 3;
      courier = "Xpressbees";
    } else {
      // Remote / North-East or standard fallback
      standardDays = 6;
      expressDays = 4;
      courier = "DTDC";
    }
    
    // Custom exclusions: J&K is Prepaid-only, express unavailable for J&K or remote North East (pincodes starting with 79)
    if (dest.state === "Jammu & Kashmir") {
      isCodAvailable = false;
      isExpressAvailable = false;
      standardDays = 6;
      courier = "DTDC";
    } else if (pincode.startsWith("79")) {
      isExpressAvailable = false; // Disable express to remote NE states
      standardDays = 7;
      courier = "Xpressbees";
    }
    
    // Calculate delivery dates
    const addDays = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString("en-IN", { weekday: 'long', month: 'short', day: 'numeric' });
    };
    
    const standardDate = addDays(standardDays);
    const expressDate = addDays(expressDays);
    
    // Calculate shipping prices
    const standardPrice = Number(subtotal) >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    const expressPrice = settings.expressShippingFee;
    
    res.json({
      success: true,
      data: {
        pincode,
        city: dest.city,
        state: dest.state,
        isCodAvailable,
        standard: {
          days: standardDays,
          dateString: standardDate,
          price: standardPrice,
          courier,
        },
        express: {
          days: expressDays,
          dateString: expressDate,
          price: expressPrice,
          courier: "Blue Dart Express",
          isAvailable: isExpressAvailable,
        }
      }
    });
  })
);

export default router;
