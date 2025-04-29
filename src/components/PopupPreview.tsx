
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
  BellRing
} from "lucide-react";
import { toast } from "sonner";

const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    reviews: 4.8,
    shipping: "2-3 days",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=80",
    tags: ["lowest", "fast", "balanced", "review"],
  },
  {
    id: 2,
    name: "Ultra Smart Speaker",
    price: 59.0,
    oldPrice: 79.0,
    reviews: 4.6,
    shipping: "1-2 days",
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
    img: "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&w=320&q=80",
    tags: ["lowest", "balanced"],
  },
  {
    id: 4,
    name: "HD Web Camera",
    price: 48.5,
    oldPrice: 62.25,
    reviews: 4.9,
    shipping: "5-7 days",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=320&q=80",
    tags: ["review", "balanced"],
  },
  {
    id: 5,
    name: "Portable Monitor",
    price: 123.0,
    oldPrice: 155.0,
    reviews: 4.7,
    shipping: "1 day",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=320&q=80",
    tags: ["fast", "balanced"],
  },
];

const prioritizeOptions = [
  {
    label: "Lowest Price",
    icon: <ArrowDown className="text-savvy-green" size={18} />,
    value: "lowest",
    desc: "See the best deals for similar products.",
  },
  {
    label: "Best Reviews",
    icon: <Star className="text-yellow-400" size={18} />,
    value: "review",
    desc: "Products praised by customers.",
  },
  {
    label: "Fast Shipping",
    icon: <Truck className="text-savvy-blue" size={18} />,
    value: "fast",
    desc: "Quick delivery options.",
  },
  {
    label: "Balanced",
    icon: <Equal className="text-savvy-purple" size={18} />,
    value: "balanced",
    desc: "A smart mix of price, speed, quality, and reviews.",
  },
];

const displayOptions = [
  { label: "Show Trust Scores", icon: <Heart className="text-savvy-green" size={18} />, value: "trust" },
  { label: "Show Alternative Products", icon: <ArrowUp className="text-savvy-blue" size={18} />, value: "alts" },
  { label: "Notify on Price Drops", icon: <Star className="text-savvy-yellow" size={18} />, value: "price-drops" },
];

const getFilteredProducts = (mode: string) => {
  // Define high-review products
  const highReviewProducts = mockProducts.filter(p => p.reviews >= 4.5);
  
  // Define fast shipping products
  const fastShippingProducts = mockProducts.filter(p => p.tags.includes("fast"));
  
  switch(mode) {
    case "lowest":
      return mockProducts.filter(p => p.tags.includes("lowest"));
    case "review":
      return mockProducts.filter(p => p.tags.includes("review"));
    case "fast":
      return mockProducts.filter(p => p.tags.includes("fast"));
    case "balanced":
      // For balanced, MUST include review products AND fast shipping products
      const combinedProducts = [...highReviewProducts];
      
      // Add fast shipping products that aren't already in the list
      fastShippingProducts.forEach(product => {
        if (!combinedProducts.some(p => p.id === product.id)) {
          combinedProducts.push(product);
        }
      });
      
      // Optionally add balanced tagged products not already included
      const balancedProducts = mockProducts.filter(p => p.tags.includes("balanced"));
      balancedProducts.forEach(product => {
        if (!combinedProducts.some(p => p.id === product.id)) {
          combinedProducts.push(product);
        }
      });
      
      return combinedProducts;
    default:
      return mockProducts;
  }
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
    setNotifyPriceDrops(prev => !prev);
    if (!notifyPriceDrops) {
      toast("Price drop notifications enabled", {
        description: "We'll notify you when prices drop for products you're watching",
        icon: <BellRing className="text-savvy-yellow" size={18} />,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-xs w-[370px] !p-0 rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-[#F1EDFC] to-[#E6FAFB] overflow-hidden"
      >
        <div className="relative pb-2">
          <div className="absolute inset-0 h-[160px] bg-gradient-to-tr from-savvy-purple/80 via-savvy-blue/70 to-[#d6bcfa] rounded-b-3xl blur-[1px] -z-1" />
          <div className="relative z-10 flex flex-col items-center pt-9 pb-6">
            <div className="mb-2 flex items-center justify-center">
              <span className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center shadow-lg ring-2 ring-white/60 backdrop-blur-sm mr-0">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <rect x="6" y="6" width="24" height="24" rx="7" fill="#8B5CF6" />
                  <rect x="10.5" y="10.5" width="15" height="15" rx="4" fill="#fff" opacity="0.8"/>
                  <rect x="14" y="14" width="8" height="8" rx="2" fill="#60A5FA" opacity="0.85"/>
                </svg>
              </span>
            </div>
            <span className="font-extrabold text-[20px] tracking-tight text-savvy-purple drop-shadow text-center">
              Scout.io
            </span>
            <div className="inline-block align-top mt-2 px-3 py-1 rounded-md bg-white/60 font-semibold text-xs uppercase text-savvy-purple tracking-wide shadow-sm">
              BETA
            </div>
            <div className="mt-3 text-xs text-white font-semibold bg-savvy-blue/60 px-3 py-1 rounded-lg shadow-xl w-fit animate-fade-in">
              🚀 Try it for Free!
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-7 pb-2 pt-3">
          <div>
            <h2 className="text-sm font-semibold mb-1 text-savvy-purple flex items-center gap-1 drop-shadow">
              <Lock className="text-savvy-purple mr-1" size={15} /> Enable Extension
            </h2>
            <p className="text-xs text-gray-500">
              Show overlay while browsing products
            </p>
          </div>
          <span className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked readOnly className="peer sr-only" />
            <span className="w-11 h-6 bg-gray-200 peer-checked:bg-savvy-purple rounded-full transition peer-focus:ring-2 peer-focus:ring-savvy-purple/40" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 peer-checked:border-savvy-purple rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow" />
          </span>
        </div>

        <div className="mt-2 px-7">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Prioritize Results By</h2>
          <div className="grid grid-cols-2 gap-3 mb-2">
            {prioritizeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`flex flex-1 items-center gap-2 px-3 py-2 rounded-xl border transition-all border-transparent shadow-md hover:shadow-xl focus:outline-none
                  ${
                    selectedPriority === opt.value
                      ? "bg-savvy-purple/90 text-white scale-[1.03] border-savvy-purple shadow-lg"
                      : "bg-white text-gray-700 hover:bg-savvy-purple/5"
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
          <div className="text-xs text-gray-500 font-medium min-h-[18px] mb-1 px-1">
            {prioritizeOptions.find((o) => o.value === selectedPriority)?.desc}
          </div>
        </div>

        <div className="mt-1 px-5 pb-1">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
            {filteredProducts.length ? (
              filteredProducts.slice(0, 3).map((product) => (
                <a
                  key={product.id}
                  href={`https://your-business-website.com/product/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-36 bg-white rounded-2xl shadow ring-1 ring-savvy-purple/15 p-2 flex flex-col items-center transition-all hover:scale-105 hover:shadow-xl hover:bg-savvy-blue/10 cursor-pointer group outline-none focus:ring-2 focus:ring-savvy-blue"
                  style={{ minWidth: "8.5rem" }}
                >
                  <div
                    className="w-24 h-20 rounded-xl overflow-hidden mb-2"
                    style={{
                      boxShadow: "0 2px 12px 0 rgba(139,92,246,0.10)",
                    }}
                  >
                    <img
                      src={product.img}
                      className="w-full h-full object-cover transition-all group-hover:brightness-90"
                      alt={product.name}
                    />
                  </div>
                  <div className="font-semibold text-xs text-gray-800 text-center truncate w-full mb-0.5">
                    {product.name}
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-savvy-purple font-bold text-sm">
                      ${product.price}
                    </span>
                    {product.oldPrice && product.oldPrice !== product.price ? (
                      <span className="text-gray-400 text-xs line-through">
                        ${product.oldPrice}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-center text-[11px] gap-1 text-gray-500">
                    {selectedPriority === "review" ? (
                      <>
                        <Star size={13} className="text-yellow-400" />
                        <span>{product.reviews}</span>
                        {showTrustScores && (
                          <span className="ml-1 text-xs bg-savvy-green/10 text-savvy-green font-bold px-1.5 py-0.5 rounded">Trust</span>
                        )}
                      </>
                    ) : selectedPriority === "fast" ? (
                      <>
                        <Truck size={13} className="text-savvy-blue" />
                        <span>{product.shipping}</span>
                        {showTrustScores && (
                          <span className="ml-1 text-xs bg-savvy-green/10 text-savvy-green font-bold px-1.5 py-0.5 rounded">Trust</span>
                        )}
                      </>
                    ) : (
                      <>
                        <ArrowDown size={13} className="text-savvy-green" />
                        <span>Deal!</span>
                        {showTrustScores && (
                          <span className="ml-1 text-xs bg-savvy-green/10 text-savvy-green font-bold px-1.5 py-0.5 rounded">Trust</span>
                        )}
                      </>
                    )}
                  </div>
                </a>
              ))
            ) : (
              <div className="text-xs text-gray-400 px-2 py-4">
                No products found for this mode.
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 px-7">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Display Options</h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-[#8B5CF6] mr-1"
                checked={showTrustScores}
                onChange={() => setShowTrustScores((v) => !v)}
              />
              <Heart className="text-savvy-green" size={18} />
              <span className="font-medium text-gray-700">
                Show Trust Scores
              </span>
            </label>
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-[#8B5CF6] mr-1"
                checked={showAlternatives}
                onChange={() => setShowAlternatives((v) => !v)}
              />
              <ArrowUp className="text-savvy-blue" size={18} />
              <span className="font-medium text-gray-700">
                Show Alternative Products
              </span>
            </label>
            <label className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow hover:shadow-md transition cursor-pointer group">
              <input
                type="checkbox"
                className="accent-[#8B5CF6] mr-1"
                checked={notifyPriceDrops}
                onChange={handleNotifyPriceDrops}
              />
              <Star className="text-savvy-yellow group-hover:scale-110 transition-transform" size={18} />
              <span className="font-medium text-gray-700">
                Notify on Price Drops
              </span>
            </label>
          </div>
        </div>

        {notifyPriceDrops && (
          <div className="px-7 mt-4">
            <div className="bg-savvy-yellow/15 border border-savvy-yellow/30 text-savvy-yellow rounded-xl px-4 py-3 text-xs font-semibold shadow-sm flex items-center gap-2 animate-fade-in">
              <BellRing className="text-savvy-yellow" size={18} />
              Price drop alerts are now active!
            </div>
          </div>
        )}

        {showAlternatives && (
          <div className="px-7 mt-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Alternative Products
            </h2>
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 shadow">
                <p className="text-xs text-gray-600 mb-2">A smart mix of price, speed, and quality.</p>
                <div className="grid grid-cols-3 gap-2">
                  {filteredProducts.slice(0, 3).map((product) => (
                    <div key={`alt-${product.id}`} className="bg-gray-50 rounded-md p-2 text-center">
                      <div className="w-full h-10 mb-1 overflow-hidden rounded">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] font-medium text-gray-700 truncate">{product.name}</div>
                      <div className="text-[11px] font-bold text-savvy-purple">${product.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-7 mt-8 flex justify-center">
          <div className="flex items-center w-full rounded-2xl shadow-lg bg-gradient-to-br from-[#8B5CF6]/90 via-[#3B82F6]/70 to-[#a5b4fc]/80 p-4 ring-2 ring-white/40 backdrop-blur-lg relative">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1">
                <Heart size={15} className="inline-block text-white/90" />
                Your Free Trial
              </h3>
              <p className="text-xs text-white/85">
                <span className="font-bold">7</span> days remaining
              </p>
            </div>
            <button
              className="bg-white shadow text-savvy-purple rounded-md px-4 py-1.5 ml-4 text-xs font-bold hover:bg-savvy-green/10 active:scale-95 transition-all duration-100"
              style={{ boxShadow: "0 2px 6px 0 rgba(70,70,120,0.08)" }}
            >
              Upgrade
            </button>
          </div>
        </div>

        <footer className="px-7 py-5 mt-3 border-t border-gray-100 bg-transparent">
          <div className="flex gap-6 justify-center">
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">
              Help
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">
              Privacy
            </a>
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">
              Terms
            </a>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default PopupPreview;
