export interface CalcCartItem {
  productId: string;
  price: number;
  quantity: number;
  category?: string;
  title: string;
  image: string;
  size: string;
  color: string;
  rewardCoins: number;
}

export interface CalculatedItem extends CalcCartItem {
  freeQuantity: number;
  offerDiscount: number;
  lineTotal: number;
}

export function calculateOffers(
  cartItems: CalcCartItem[],
  activeOffers: any[]
) {
  // 1. Expand all cart items into individual units
  const units: {
    productId: string;
    price: number;
    category: string;
    cartItemIdx: number;
    claimed: boolean;
    free: boolean;
    offerId?: string;
  }[] = [];

  cartItems.forEach((item, idx) => {
    const categoryIdStr = item.category
      ? (typeof item.category === "object" ? (item.category as any)._id?.toString() : item.category.toString())
      : "";

    for (let q = 0; q < item.quantity; q++) {
      units.push({
        productId: item.productId.toString(),
        price: item.price,
        category: categoryIdStr,
        cartItemIdx: idx,
        claimed: false,
        free: false,
      });
    }
  });

  const appliedOffersList: { offerId: string; title: string; discount: number }[] = [];
  let totalOfferDiscount = 0;

  // 2. Process active offers
  for (const offer of activeOffers) {
    // Filter unclaimed units eligible for this offer
    const eligibleUnits = units.filter((u) => {
      if (u.claimed) return false;

      if (offer.targetType === "all") {
        return true;
      } else if (offer.targetType === "category") {
        const catIdStr = u.category;
        if (!catIdStr) return false;
        return offer.targetCategories.some((cId: any) => cId.toString() === catIdStr);
      } else if (offer.targetType === "product") {
        return offer.targetProducts.some((pId: any) => pId.toString() === u.productId);
      }
      return false;
    });

    const Q = eligibleUnits.length;
    const bundleSize = offer.buyQuantity + offer.getQuantity;

    if (Q >= bundleSize) {
      const numFree = Math.floor(Q / bundleSize) * offer.getQuantity;
      if (numFree > 0) {
        // Sort eligible units by price ascending (cheapest ones become free)
        eligibleUnits.sort((a, b) => a.price - b.price);

        // Mark the first numFree units as free and claimed
        let freeCount = 0;
        for (let i = 0; i < eligibleUnits.length; i++) {
          const unit = eligibleUnits[i];
          if (freeCount < numFree) {
            unit.free = true;
            unit.claimed = true;
            unit.offerId = offer._id.toString();
            freeCount++;
          }
        }

        // Claim buyQuantity units per free unit from the remaining units in the bundle
        const buyUnitsToClaim = numFree * offer.buyQuantity;
        let claimedBuyCount = 0;

        // Loop backwards (most expensive remaining) to claim them
        for (let i = eligibleUnits.length - 1; i >= 0; i--) {
          const unit = eligibleUnits[i];
          if (!unit.free && !unit.claimed && claimedBuyCount < buyUnitsToClaim) {
            unit.claimed = true;
            claimedBuyCount++;
          }
        }

        // Calculate discount for this offer
        let offerDiscount = 0;
        eligibleUnits.forEach((u) => {
          if (u.free && u.offerId === offer._id.toString()) {
            offerDiscount += u.price;
          }
        });

        if (offerDiscount > 0) {
          totalOfferDiscount += offerDiscount;
          appliedOffersList.push({
            offerId: offer._id.toString(),
            title: offer.title,
            discount: offerDiscount,
          });
        }
      }
    }
  }

  // 3. Map back to cartItems
  const updatedItems: CalculatedItem[] = cartItems.map((item, idx) => {
    const itemUnits = units.filter((u) => u.cartItemIdx === idx);
    const freeQuantity = itemUnits.filter((u) => u.free).length;
    const offerDiscount = itemUnits.filter((u) => u.free).reduce((sum, u) => sum + u.price, 0);
    const lineTotal = Math.max(0, item.price * item.quantity - offerDiscount);

    return {
      ...item,
      freeQuantity,
      offerDiscount,
      lineTotal,
    };
  });

  return {
    items: updatedItems,
    offerDiscount: totalOfferDiscount,
    appliedOffers: appliedOffersList,
  };
}
