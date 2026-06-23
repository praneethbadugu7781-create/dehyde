export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: Category | string;
  price: number;
  compareAtPrice?: number;
  sizes: string[];
  variants: { color: string; colorHex?: string; images: string[]; sizes: { size: string; stock: number }[]; stock: number }[];
  images: string[];
  stock: number;
  rewardCoins: number;
  featured: boolean;
  trending: boolean;
  tags: string[];
}

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  rewardCoins: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  addresses: Address[];
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  product: string;
  title: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  rewardCoins: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discount: number;
  coinsRedeemed: number;
  coinDiscount: number;
  shipping: number;
  total: number;
  coinsEarned: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  history: { type: string; amount: number; description: string; createdAt: string }[];
}
