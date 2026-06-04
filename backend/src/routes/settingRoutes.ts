import { Router } from "express";
import { Settings } from "../models/Settings.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// Mappings of the first 2 digits of the pincode to State name, representative city, and coordinates (lat, lng)
const PINCODE_MAP: Record<string, { state: string; city: string; lat: number; lng: number }> = {
  "11": { state: "Delhi", city: "New Delhi", lat: 28.6139, lng: 77.2090 },
  "12": { state: "Haryana", city: "Faridabad", lat: 28.4089, lng: 77.3178 },
  "13": { state: "Haryana", city: "Panchkula", lat: 30.6942, lng: 76.8606 },
  "14": { state: "Punjab", city: "Ludhiana", lat: 30.9010, lng: 75.8573 },
  "15": { state: "Punjab", city: "Bathinda", lat: 30.2110, lng: 74.9455 },
  "16": { state: "Chandigarh", city: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  "17": { state: "Himachal Pradesh", city: "Shimla", lat: 31.1048, lng: 77.1734 },
  "18": { state: "Jammu & Kashmir", city: "Jammu", lat: 32.7266, lng: 74.8570 },
  "19": { state: "Jammu & Kashmir", city: "Srinagar", lat: 34.0837, lng: 74.7973 },
  "20": { state: "Uttar Pradesh", city: "Ghaziabad", lat: 28.6692, lng: 77.4538 },
  "21": { state: "Uttar Pradesh", city: "Kanpur", lat: 26.4499, lng: 80.3319 },
  "22": { state: "Uttar Pradesh", city: "Lucknow", lat: 26.8467, lng: 80.9462 },
  "23": { state: "Uttar Pradesh", city: "Allahabad", lat: 25.4358, lng: 81.8463 },
  "24": { state: "Uttar Pradesh", city: "Bareilly", lat: 28.3607, lng: 79.4128 },
  "25": { state: "Uttar Pradesh", city: "Meerut", lat: 28.9845, lng: 77.7064 },
  "26": { state: "Uttarakhand", city: "Dehradun", lat: 30.3165, lng: 78.0322 },
  "27": { state: "Uttar Pradesh", city: "Gorakhpur", lat: 26.7606, lng: 83.3731 },
  "28": { state: "Uttar Pradesh", city: "Jhansi", lat: 25.4484, lng: 78.5685 },
  "30": { state: "Rajasthan", city: "Jaipur", lat: 26.9124, lng: 75.7873 },
  "31": { state: "Rajasthan", city: "Udaipur", lat: 24.5854, lng: 73.7125 },
  "32": { state: "Rajasthan", city: "Kota", lat: 25.2138, lng: 75.8648 },
  "33": { state: "Rajasthan", city: "Jodhpur", lat: 26.2389, lng: 73.0243 },
  "34": { state: "Rajasthan", city: "Bikaner", lat: 28.0166, lng: 73.3119 },
  "36": { state: "Gujarat", city: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  "37": { state: "Gujarat", city: "Rajkot", lat: 22.3039, lng: 70.8022 },
  "38": { state: "Gujarat", city: "Surat", lat: 21.1702, lng: 72.8311 },
  "39": { state: "Gujarat", city: "Vadodara", lat: 22.3072, lng: 73.1812 },
  "40": { state: "Maharashtra", city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  "41": { state: "Maharashtra", city: "Pune", lat: 18.5204, lng: 73.8567 },
  "42": { state: "Maharashtra", city: "Aurangabad", lat: 19.8762, lng: 75.3433 },
  "43": { state: "Maharashtra", city: "Kolhapur", lat: 16.7050, lng: 74.2433 },
  "44": { state: "Maharashtra", city: "Nagpur", lat: 21.1458, lng: 79.0882 },
  "45": { state: "Madhya Pradesh", city: "Indore", lat: 22.7196, lng: 75.8577 },
  "46": { state: "Madhya Pradesh", city: "Bhopal", lat: 23.2599, lng: 77.4126 },
  "47": { state: "Madhya Pradesh", city: "Gwalior", lat: 26.2183, lng: 78.1828 },
  "48": { state: "Madhya Pradesh", city: "Jabalpur", lat: 23.1815, lng: 79.9864 },
  "49": { state: "Chhattisgarh", city: "Raipur", lat: 21.2514, lng: 81.6296 },
  "50": { state: "Telangana", city: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  "51": { state: "Andhra Pradesh", city: "Guntur", lat: 16.3067, lng: 80.4365 },
  "52": { state: "Andhra Pradesh", city: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
  "53": { state: "Andhra Pradesh", city: "Vijayawada", lat: 16.5062, lng: 80.6480 },
  "56": { state: "Karnataka", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  "57": { state: "Karnataka", city: "Mysuru", lat: 12.2958, lng: 76.6394 },
  "58": { state: "Karnataka", city: "Hubli", lat: 15.3647, lng: 75.1240 },
  "59": { state: "Karnataka", city: "Belagavi", lat: 15.8497, lng: 74.4977 },
  "60": { state: "Tamil Nadu", city: "Chennai", lat: 13.0827, lng: 80.2707 },
  "61": { state: "Tamil Nadu", city: "Madurai", lat: 9.9252, lng: 78.1198 },
  "62": { state: "Tamil Nadu", city: "Coimbatore", lat: 11.0168, lng: 76.9558 },
  "63": { state: "Tamil Nadu", city: "Trichy", lat: 10.7905, lng: 78.7047 },
  "64": { state: "Tamil Nadu", city: "Salem", lat: 11.6643, lng: 78.1460 },
  "67": { state: "Kerala", city: "Kochi", lat: 9.9312, lng: 76.2673 },
  "68": { state: "Kerala", city: "Trivandrum", lat: 8.5241, lng: 76.9366 },
  "69": { state: "Kerala", city: "Kozhikode", lat: 11.2588, lng: 75.7804 },
  "70": { state: "West Bengal", city: "Kolkata", lat: 22.5726, lng: 88.3639 },
  "71": { state: "West Bengal", city: "Siliguri", lat: 26.7271, lng: 88.3953 },
  "72": { state: "West Bengal", city: "Durgapur", lat: 23.5204, lng: 87.3119 },
  "73": { state: "West Bengal", city: "Kharagpur", lat: 22.3460, lng: 87.2300 },
  "74": { state: "West Bengal", city: "Howrah", lat: 22.5958, lng: 88.2636 },
  "75": { state: "Odisha", city: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  "76": { state: "Odisha", city: "Cuttack", lat: 20.4625, lng: 85.8830 },
  "77": { state: "Odisha", city: "Rourkela", lat: 22.2604, lng: 84.8536 },
  "78": { state: "Assam", city: "Guwahati", lat: 26.1445, lng: 91.7362 },
  "79": { state: "Meghalaya", city: "Shillong", lat: 25.5788, lng: 91.8831 },
  "80": { state: "Bihar", city: "Patna", lat: 25.5941, lng: 85.1376 },
  "81": { state: "Bihar", city: "Muzaffarpur", lat: 26.1209, lng: 85.3647 },
  "82": { state: "Bihar", city: "Bhagalpur", lat: 25.2425, lng: 87.0135 },
  "83": { state: "Jharkhand", city: "Ranchi", lat: 23.3441, lng: 85.3096 },
  "84": { state: "Jharkhand", city: "Jamshedpur", lat: 22.8046, lng: 86.2029 },
  "85": { state: "Jharkhand", city: "Dhanbad", lat: 23.7957, lng: 86.4304 }
};

function getPincodeDetails(pincode: string) {
  const prefix2 = pincode.substring(0, 2);
  const prefix1 = pincode.substring(0, 1);
  return PINCODE_MAP[prefix2] || PINCODE_MAP[prefix1 + "0"] || { state: "India", city: "Domestic Circle", lat: 21.0, lng: 78.0 };
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
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
    
    // Return only public variables
    res.json({
      success: true,
      data: {
        rewardsEnabled: settings.rewardsEnabled,
        freeShippingThreshold: settings.freeShippingThreshold,
        defaultShippingFee: settings.defaultShippingFee,
        expressShippingFee: settings.expressShippingFee,
        warehousePincode: settings.warehousePincode,
        warehouseCity: settings.warehouseCity,
        warehouseState: settings.warehouseState,
      }
    });
  })
);

// Estimate shipping details (distance, speeds, price, delivery dates, COD status)
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
    const origin = getPincodeDetails(settings.warehousePincode || "560001");
    
    // Calculate geographic distance in km
    const distance = haversineDistance(origin.lat, origin.lng, dest.lat, dest.lng);
    
    // Auto-calculate delivery speeds
    let standardDays = 3;
    let expressDays = 2;
    
    if (distance < 100) {
      standardDays = 2;
      expressDays = 1;
    } else if (distance < 600) {
      standardDays = 3;
      expressDays = 2;
    } else if (distance < 1500) {
      standardDays = 4;
      expressDays = 3;
    } else if (distance < 2500) {
      standardDays = 5;
      expressDays = 3;
    } else {
      standardDays = 7;
      expressDays = 5; // Long distance or remote
    }
    
    // Auto-calculate delivery dates
    const addDays = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toLocaleDateString("en-IN", { weekday: 'long', month: 'short', day: 'numeric' });
    };
    
    const standardDate = addDays(standardDays);
    const expressDate = addDays(expressDays);
    
    // Courier assignments
    const standardCourier = distance < 1500 ? "Delhivery" : "Xpressbees";
    const expressCourier = "Blue Dart Express";
    
    // COD eligibility rule (Prepaid-only if distance > 2000 km, representing J&K, far North-East, etc.)
    const isCodAvailable = distance < 2000 && dest.state !== "Jammu & Kashmir";
    
    // Calculate shipping prices
    const standardPrice = Number(subtotal) >= settings.freeShippingThreshold ? 0 : settings.defaultShippingFee;
    const expressPrice = settings.expressShippingFee;
    
    res.json({
      success: true,
      data: {
        pincode,
        city: dest.city,
        state: dest.state,
        distance,
        warehouseName: settings.warehouseCity || "Bengaluru",
        isCodAvailable,
        standard: {
          days: standardDays,
          dateString: standardDate,
          price: standardPrice,
          courier: standardCourier,
        },
        express: {
          days: expressDays,
          dateString: expressDate,
          price: expressPrice,
          courier: expressCourier,
          isAvailable: distance < 2500, // Express delivery only for distance < 2500 km
        }
      }
    });
  })
);

export default router;
