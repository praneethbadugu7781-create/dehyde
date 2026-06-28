import { calculateOffers, CalcCartItem } from "../utils/offerCalculator.js";

// Mock Offers
const mockOffers = [
  {
    _id: "offer-shirt-b2g1",
    title: "Buy 2 Get 1 Free on Shirts",
    type: "buyXgetY",
    buyQuantity: 2,
    getQuantity: 1,
    targetType: "category",
    targetCategories: ["cat-shirts"],
    targetProducts: [],
    isActive: true,
  },
  {
    _id: "offer-pants-b1g1",
    title: "Buy 1 Get 1 Free on Pants",
    type: "buyXgetY",
    buyQuantity: 1,
    getQuantity: 1,
    targetType: "category",
    targetCategories: ["cat-pants"],
    targetProducts: [],
    isActive: true,
  }
];

// Test Case 1: 3 Shirts of different prices (₹1200, ₹1000, ₹800)
// Cheapest should be free. Offer discount should be ₹800.
const cart1: CalcCartItem[] = [
  {
    productId: "prod-shirt-a",
    price: 1200,
    quantity: 1,
    category: "cat-shirts",
    title: "Premium Shirt A",
    image: "",
    size: "M",
    color: "Black",
    rewardCoins: 0,
  },
  {
    productId: "prod-shirt-b",
    price: 1000,
    quantity: 1,
    category: "cat-shirts",
    title: "Premium Shirt B",
    image: "",
    size: "M",
    color: "White",
    rewardCoins: 0,
  },
  {
    productId: "prod-shirt-c",
    price: 800,
    quantity: 1,
    category: "cat-shirts",
    title: "Premium Shirt C",
    image: "",
    size: "M",
    color: "Grey",
    rewardCoins: 0,
  }
];

console.log("--- TEST CASE 1: 3 different shirts (Buy 2 Get 1) ---");
const result1 = calculateOffers(cart1, mockOffers);
console.log("Offer Discount calculated:", result1.offerDiscount, "(Expected: 800)");
console.log("Line Items:");
result1.items.forEach(item => {
  console.log(`- ${item.title}: Price: ₹${item.price}, Qty: ${item.quantity}, Free Qty: ${item.freeQuantity}, Line Total: ₹${item.lineTotal}`);
});

// Test Case 2: 5 Shirts of ₹1000 each.
// Should get 1 free. Offer discount should be ₹1000.
const cart2: CalcCartItem[] = [
  {
    productId: "prod-shirt-a",
    price: 1000,
    quantity: 5,
    category: "cat-shirts",
    title: "Standard Shirt",
    image: "",
    size: "M",
    color: "Black",
    rewardCoins: 0,
  }
];

console.log("\n--- TEST CASE 2: 5 identical shirts (Buy 2 Get 1) ---");
const result2 = calculateOffers(cart2, mockOffers);
console.log("Offer Discount calculated:", result2.offerDiscount, "(Expected: 1000)");
console.log("Line Items:");
result2.items.forEach(item => {
  console.log(`- ${item.title}: Price: ₹${item.price}, Qty: ${item.quantity}, Free Qty: ${item.freeQuantity}, Line Total: ₹${item.lineTotal}`);
});

// Test Case 3: Mixed items: 3 Shirts (₹1000 each) + 2 Pants (₹1500 each)
// Shirt discount: 1 free shirt = ₹1000
// Pant discount: 1 free pant = ₹1500 (Buy 1 Get 1)
// Total discount should be ₹2500.
const cart3: CalcCartItem[] = [
  {
    productId: "prod-shirt-a",
    price: 1000,
    quantity: 3,
    category: "cat-shirts",
    title: "Standard Shirt",
    image: "",
    size: "M",
    color: "Black",
    rewardCoins: 0,
  },
  {
    productId: "prod-pant-a",
    price: 1500,
    quantity: 2,
    category: "cat-pants",
    title: "Premium Pant",
    image: "",
    size: "32",
    color: "Black",
    rewardCoins: 0,
  }
];

console.log("\n--- TEST CASE 3: Mixed Shirts and Pants (Multiple Offers) ---");
const result3 = calculateOffers(cart3, mockOffers);
console.log("Offer Discount calculated:", result3.offerDiscount, "(Expected: 2500)");
console.log("Line Items:");
result3.items.forEach(item => {
  console.log(`- ${item.title}: Price: ₹${item.price}, Qty: ${item.quantity}, Free Qty: ${item.freeQuantity}, Line Total: ₹${item.lineTotal}`);
});
console.log("Applied Offers:", result3.appliedOffers);
