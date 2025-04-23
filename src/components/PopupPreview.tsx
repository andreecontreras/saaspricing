import { Sheet, SheetContent } from "@/components/ui/sheet";
import React, { useState } from "react";
import {
  Star,
  ArrowUp,
  ArrowDown,
  Truck,
  Equal,
  Heart,
  Lock,
} from "lucide-react";

const mockProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 39.99,
    oldPrice: 64.99,
    reviews: 4.8,
    shipping: "2-3 days",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=320&q=80",
    tags: ["lowest", "fast", "balanced"],
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
    desc: "A smart mix of price, speed, and quality.",
  },
];

const displayOptions = [
  { label: "Show Trust Scores", icon: <Heart className="text-savvy-green" size={18} />, value: "trust" },
  { label: "Show Alternative Products", icon: <ArrowUp className="text-savvy-blue" size={18} />, value: "alts" },
  { label: "Notify on Price Drops", icon: <Star className="text-savvy-yellow" size={18} />, value: "price-drops" },
];

const getFilteredProducts = (mode: string) => {
  if (mode === "balanced") {
    return mockProducts;
  }
  return mockProducts.filter((p) => p.tags.includes(mode));
};

const PopupPreview: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const [selectedPriority, setSelectedPriority] = useState("balanced");

  const filteredProducts = getFilteredProducts(selectedPriority);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-xs w-[350px] !p-0 rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-[#F1EDFC] to-[#E6FAFB] overflow-hidden"
      >
        <div className="relative overflow-hidden">
          <div
            className="absolute -top-[32%] left-0 w-full h-[180px] z-0 select-none pointer-events-none"
            style={{
              background: "linear-gradient(115deg,#a78bfa 0%,#38bdf8 100%)",
              borderBottomRightRadius: "80px",
              borderBottomLeftRadius: "80px",
              filter: "blur(0px)",
            }}
          />
          <div className="absolute right-0 top-10 w-20 h-20 opacity-40 rotate-12 z-0">
            <svg width="90" height="90">
              <circle cx="45" cy="45" r="43" fill="#e0e7ff" />
              <ellipse cx="75" cy="37" rx="11" ry="3" fill="#bae6fd" />
            </svg>
          </div>
          <header className="relative z-10 px-7 pt-8 pb-4 flex items-start">
            <div className="bg-white/30 shadow-md border border-white/40 w-11 h-11 mr-4 flex items-center justify-center rounded-xl backdrop-blur">
              <svg
                width={32}
                height={32}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 1px 10px #a5b4fc)" }}
              >
                <rect width="22" height="22" x="5" y="5" rx="6" />
                <path d="M16 10v4l2 2" />
                <circle cx="12" cy="16.5" r="1" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-700 drop-shadow-sm">
                Savvy Shop Whisper
              </span>
              <div className="inline-block align-top ml-2 px-2 py-1 rounded-md bg-white/30 font-semibold text-xs uppercase text-savvy-purple tracking-widest shadow-sm">
                BETA
              </div>
              <div className="mt-2 text-xs text-white/80 font-semibold rounded-md bg-savvy-purple/80 px-2 py-0.5 shadow-xl w-fit">
                🚀 Try it for Free!
              </div>
            </div>
          </header>
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
                <div
                  key={product.id}
                  className="flex-shrink-0 w-36 bg-white rounded-2xl shadow ring-1 ring-savvy-purple/15 p-2 flex flex-col items-center transition-all hover:scale-105 hover:shadow-xl"
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
                      className="w-full h-full object-cover"
                      alt="product visual"
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
                      </>
                    ) : selectedPriority === "fast" ? (
                      <>
                        <Truck size={13} className="text-savvy-blue" />
                        <span>{product.shipping}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown size={13} className="text-savvy-green" />
                        <span>Deal!</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 px-2 py-4">
                No products found for this mode.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 px-7">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Display Options
          </h2>
          <div className="flex flex-col gap-3">
            {displayOptions.map((opt, i) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow hover:shadow-md transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="accent-[#8B5CF6] mr-1"
                  defaultChecked
                  readOnly
                />
                {opt.icon}
                <span className="font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

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
