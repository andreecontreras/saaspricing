import { Sheet, SheetContent } from "@/components/ui/sheet";
import React, { useState, useEffect } from "react";
import {
  Star,
  ArrowUp,
  ArrowDown,
  Truck,
  Equal,
  Heart,
  Lock,
  BellRing,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ui/product-card";

const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    reviews: 4.8,
    shipping: "2-3 days",
    quality: "High",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=80",
    tags: ["lowest", "fast", "balanced", "review", "quality"],
  },
  {
    id: 2,
    name: "Ultra Smart Speaker",
    price: 59.0,
    oldPrice: 79.0,
    reviews: 4.6,
    shipping: "1-2 days",
    quality: "Medium",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=320&q=80",
    tags: ["review", "fast", "balanced"],
  },
  {
    id: 3,
    name: "Eco LED Desk Lamp",
    price: 24.49,
    oldPrice: 34.0,
    reviews: 4.2,
    shipping: "2 days",
    quality: "High",
    img: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=320&q=80",
    tags: ["lowest", "balanced", "quality"],
  },
  {
    id: 4,
    name: "HD Web Camera",
    price: 48.5,
    oldPrice: 62.25,
    reviews: 4.9,
    shipping: "5-7 days",
    quality: "High",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=320&q=80",
    tags: ["review", "balanced", "quality"],
  },
  {
    id: 5,
    name: "Portable Monitor",
    price: 123.0,
    oldPrice: 155.0,
    reviews: 4.7,
    shipping: "1 day",
    quality: "Medium",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=320&q=80",
    tags: ["fast", "balanced"],
  },
];

const prioritizeOptions = [
  {
    label: "Lowest Price",
    icon: <ArrowDown className="text-green-600" size={18} />,
    value: "lowest",
    desc: "See the best deals for similar products.",
  },
  {
    label: "Best Reviews",
    icon: <Star className="text-green-600" size={18} />,
    value: "review",
    desc: "Products praised by customers.",
  },
  {
    label: "Fast Shipping",
    icon: <Truck className="text-green-600" size={18} />,
    value: "fast",
    desc: "Quick delivery options.",
  },
  {
    label: "Balanced",
    icon: <Equal className="text-green-600" size={18} />,
    value: "balanced",
    desc: "A smart mix of price, shipping speed, and reviews.",
  },
];

const displayOptions = [
  { label: "Show Trust Scores", icon: <Heart className="text-red-600" size={18} />, value: "trust" },
  { label: "Show Similar Products", icon: <ArrowUp className="text-blue-600" size={18} />, value: "alts" },
  { label: "Notify on Price Drops", icon: <Star className="text-yellow-500" size={18} />, value: "price-drops" },
];

const getFilteredProducts = (mode: string) => {
  console.log("Filtering mode:", mode);

  // Define high-review products
  const highReviewProducts = mockProducts.filter(p => p.reviews >= 4.5);
  console.log("High review products:", highReviewProducts.map(p => p.name));

  // Define fast shipping products
  const fastShippingProducts = mockProducts.filter(p => p.shipping.includes("1-2") || p.shipping.includes("1 day"));
  console.log("Fast shipping products:", fastShippingProducts.map(p => p.name));

  // Define low price products
  const lowestPriceProducts = mockProducts.filter(p => p.tags.includes("lowest"));
  console.log("Lowest price products:", lowestPriceProducts.map(p => p.name));

  // Define high quality products
  const highQualityProducts = mockProducts.filter(p => p.quality === "High");
  console.log("High quality products:", highQualityProducts.map(p => p.name));

  let result;

  switch (mode) {
    case "lowest":
      result = mockProducts.filter(p => p.tags?.includes("lowest"));
      break;
    case "review":
      result = mockProducts.filter(p => p.reviews && p.reviews >= 4.5);
      break;
    case "fast":
      result = mockProducts.filter(p => p.shipping?.includes("1-2") || p.shipping?.includes("1 day"));
      break;
    case "balanced":
      // Create a set to store unique products
      let balancedSelection = [];

      // ALWAYS ensure we include at least one fast shipping product in the balanced view
      const fastShippingProducts = mockProducts.filter(p =>
        p.shipping?.includes("1-2") || p.shipping?.includes("1 day")
      );

      if (fastShippingProducts.length > 0) {
        balancedSelection.push(fastShippingProducts[0]);
      }

      // ALWAYS include a high review product (if not already included)
      const highReviewProducts = mockProducts.filter(p => p.reviews && p.reviews >= 4.5);

      if (highReviewProducts.length > 0) {
        const reviewProduct = highReviewProducts.find(p =>
          !balancedSelection.some(cp => cp.id === p.id)
        );
        if (reviewProduct) {
          balancedSelection.push(reviewProduct);
        }
      }

      // ALWAYS include a lowest price product (if not already included)
      const lowestPriceProducts = mockProducts.filter(p => p.tags?.includes("lowest"));

      const priceProduct = lowestPriceProducts.find(p =>
        !balancedSelection.some(cp => cp.id === p.id)
      );
      if (priceProduct) {
        balancedSelection.push(priceProduct);
      }

      // If we still have room for more products, add other balanced tagged products
      const balancedTaggedProducts = mockProducts.filter(p =>
        p.tags?.includes("balanced") &&
        !balancedSelection.some(cp => cp.id === p.id)
      );

      for (const product of balancedTaggedProducts) {
        if (balancedSelection.length < 5) {
          balancedSelection.push(product);
        } else {
          break; // We've reached our limit
        }
      }

      result = balancedSelection;
      break;
    default:
      result = mockProducts;
  }

  console.log("Final filtered products:", result.map(p => p.name));
  return result;
};

const PopupPreview: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const [selectedPriority, setSelectedPriority] = useState("balanced");
  const [showTrustScores, setShowTrustScores] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(true);
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(getFilteredProducts("balanced"));

  // Update filtered products when priority changes
  useEffect(() => {
    setFilteredProducts(getFilteredProducts(selectedPriority));
  }, [selectedPriority]);

  const handleNotifyPriceDrops = () => {
    const newValue = !notifyPriceDrops;
    setNotifyPriceDrops(newValue);
    if (newValue) {
      toast("Price drop notifications enabled", {
        description: "We'll notify you when prices drop for products you're watching",
        icon: <BellRing className="text-yellow-400" size={18} />,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-xs w-[370px] !p-0 rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-white overflow-hidden"
      >
        <div className="relative pb-2">
          <div className="absolute inset-0 h-[120px] bg-black rounded-b-3xl blur-[1px] -z-1" />
          <div className="relative z-10 flex flex-col items-center pt-6 pb-4">
            <span className="font-extrabold text-[20px] tracking-tight text-white drop-shadow text-center">
              Scout.io
            </span>
            <div className="inline-block align-top mt-2 px-3 py-1 rounded-md bg-white/60 font-semibold text-xs uppercase text-black tracking-wide shadow-sm">
              BETA
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-7 pb-4 pt-6">
          <div>
            <h2 className="text-sm font-semibold mb-1 text-black flex items-center gap-1">
              <Lock className="text-green-600 mr-1" size={15} /> Enable Extension
            </h2>
            <p className="text-xs text-gray-500">
              Show overlay while browsing products
            </p>
          </div>
          <span className="relative inline-flex items-center cursor-pointer ml-4">
            <input type="checkbox" defaultChecked className="peer sr-only" />
            <span className="w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full transition peer-focus:ring-2 peer-focus:ring-green-500/40" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 peer-checked:border-green-600 rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow" />
          </span>
        </div>

        <div className="mt-4 px-7">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Prioritize Results By</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {prioritizeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`flex flex-1 items-center gap-2 px-3 py-2.5 rounded-xl border transition-all border-transparent shadow-md hover:shadow-xl focus:outline-none
                  ${selectedPriority === opt.value
                    ? "bg-black text-white scale-[1.03] border-gray-800 shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                  }
                `}
                onClick={() => setSelectedPriority(opt.value)}
                type="button"
                aria-pressed={selectedPriority === opt.value}
              >
                <span className="">{opt.icon}</span>
                <span className="text-[13px] font-semibold flex-1 text-left">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 font-medium min-h-[18px] mb-4 px-1">
            {prioritizeOptions.find((o) => o.value === selectedPriority)?.desc}
          </div>
        </div>

        <div className="px-7 mb-4">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1">
            {filteredProducts.length ? (
              filteredProducts.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    reviews: product.reviews,
                    shipping: product.shipping,
                    quality: product.quality,
                    img: product.img,
                    tags: product.tags
                  }}
                  priorityMode={selectedPriority}
                  showTrustScore={showTrustScores}
                  onClick={() => {
                    toast.success(`Viewing ${product.name}`);
                    window.open(`https://your-business-website.com/product/${product.id}`, '_blank');
                  }}
                />
              ))
            ) : (
              <div className="text-xs text-gray-400 px-2 py-4 w-full text-center">
                No products found for this mode.
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 px-7">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Display Options</h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-green-600 mr-1"
                checked={showTrustScores}
                onChange={() => setShowTrustScores((v) => !v)}
              />
              <Heart className="text-red-600" size={18} />
              <span className="font-medium text-gray-700">
                Show Trust Scores
              </span>
            </label>
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-green-600 mr-1"
                checked={showAlternatives}
                onChange={() => setShowAlternatives((v) => !v)}
              />
              <ArrowUp className="text-blue-600" size={18} />
              <span className="font-medium text-gray-700">
                Show Similar Products
              </span>
            </label>
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-green-600 mr-1"
                checked={notifyPriceDrops}
                onChange={handleNotifyPriceDrops}
              />
              <Star className="text-yellow-500 group-hover:scale-110 transition-transform" size={18} />
              <span className="font-medium text-gray-700">
                Notify on Price Drops
              </span>
            </label>
          </div>
        </div>

        {notifyPriceDrops && (
          <div className="px-7 mt-4">
            <div className="bg-red-400/15 border border-red-400/30 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold shadow-sm flex items-center gap-2 animate-fade-in">
              <BellRing className="text-red-400" size={18} />
              Price drop alerts are now active!
            </div>
          </div>
        )}

        <footer className="px-7 py-5 mt-6 border-t border-gray-100 bg-transparent">
          <div className="flex gap-6 justify-center">
            <a href="/help" className="text-xs text-gray-500 hover:text-black transition font-medium">
              Help
            </a>
            <a href="/privacy" className="text-xs text-gray-500 hover:text-black transition font-medium">
              Privacy
            </a>
            <a href="/terms" className="text-xs text-gray-500 hover:text-black transition font-medium">
              Terms
            </a>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default PopupPreview;
