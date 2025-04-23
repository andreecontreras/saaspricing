
import { Sheet, SheetContent } from "@/components/ui/sheet";
import React from "react";
import { Star, Check, Bell, ArrowUp, ArrowDown, Heart, Cog, Lock, User, X, CircleCheck, CirclePlus, CircleMinus } from "lucide-react";

type PopupPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const prioritizeOptions = [
  { label: "Lowest Price", icon: <ArrowDown className="text-savvy-green" size={18} />, value: "price" },
  { label: "Best Reviews", icon: <Star className="text-yellow-400" size={18} />, value: "reviews" },
  { label: "Fast Shipping", icon: <ArrowUp className="text-savvy-blue" size={18} />, value: "shipping" },
  { label: "Balanced", icon: <Cog className="text-savvy-purple" size={18} />, value: "balanced" },
];

const displayOptions = [
  { label: "Show Trust Scores", icon: <CircleCheck className="text-savvy-green" size={18} />, value: "trust" },
  { label: "Show Alternative Products", icon: <CirclePlus className="text-savvy-blue" size={18} />, value: "alts" },
  { label: "Notify on Price Drops", icon: <Bell className="text-savvy-yellow" size={18} />, value: "price-drops" },
];

const PopupPreview: React.FC<PopupPreviewProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-xs w-[340px] p-0 bg-gradient-to-br from-[#ede9fe] to-[#f8fafc] rounded-xl overflow-hidden border border-gray-200 shadow-2xl"
      >
        {/* Fancy Header */}
        <div className="relative">
          <div className="absolute inset-0 rounded-b-xl" style={{
            background: "linear-gradient(90deg, #8B5CF6 50%, #3B82F6 100%)",
            opacity: 0.95,
            zIndex: 0
          }}/>
          <header className="relative z-10 flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 border border-white/30 text-white w-9 h-9 rounded-md flex items-center justify-center shadow-lg backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="10"/>
                  <path d="M8.5 8.5a2.5 2.5 0 0 1 4.86.8c0 1.8-2.5 2.7-2.5 2.7"/>
                  <line x1="11" y1="16" x2="11.01" y2="16"/>
                </svg>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight drop-shadow">Savvy Shop Whisper</h1>
              <span className="ml-2 bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full drop-shadow">BETA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-savvy-purple font-bold text-xs px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">Free Trial</span>
            </div>
          </header>
        </div>

        <div className="pb-2" />

        {/* Toggle */}
        <div className="flex items-center justify-between px-6 pb-2 pt-2">
          <div>
            <h2 className="text-sm font-semibold mb-1 text-gray-800 flex items-center gap-1">
              <Lock className="text-savvy-purple mr-1" size={16} /> Enable Extension
            </h2>
            <p className="text-xs text-gray-500">Show overlay while browsing products</p>
          </div>
          {/* Stylish toggle */}
          <span className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked readOnly className="peer sr-only" />
            <span className="w-11 h-6 bg-gray-200 peer-checked:bg-savvy-purple rounded-full transition peer-focus:ring-2 peer-focus:ring-savvy-purple/40" />
            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border border-gray-300 peer-checked:border-savvy-purple rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow" />
          </span>
        </div>

        {/* Prioritize Section */}
        <div className="mt-3 px-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Prioritize Results By</h2>
          <div className="grid grid-cols-2 gap-3">
            {prioritizeOptions.map((opt, i) => (
              <label key={opt.value} className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm transition-all duration-150 hover:shadow-md cursor-pointer`}>
                <input name="prioritize" type="radio" className="accent-[#8B5CF6] mr-1" defaultChecked={opt.value==="balanced"} />
                {opt.icon}
                <span className="text-[13px] font-semibold text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="mt-6 px-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Display Options</h2>
          <div className="flex flex-col gap-3">
            {displayOptions.map((opt, i) => (
              <label key={opt.value} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm shadow hover:shadow-md transition cursor-pointer">
                <input type="checkbox" className="accent-[#8B5CF6] mr-1" defaultChecked />
                {opt.icon}
                <span className="font-medium text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trial Banner */}
        <div className="px-6 mt-8 flex justify-center">
          <div className="flex items-center w-full rounded-2xl shadow-lg bg-gradient-to-br from-[#8B5CF6]/90 via-[#3B82F6]/70 to-[#a5b4fc]/80 p-4 ring-2 ring-white/40 backdrop-blur-lg relative">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1">
                <Heart size={15} className="inline-block text-white/90" /> Your Free Trial
              </h3>
              <p className="text-xs text-white/85"><span className="font-bold">7</span> days remaining</p>
            </div>
            <button
              className="bg-white shadow text-savvy-purple rounded-md px-4 py-1.5 ml-4 text-xs font-bold hover:bg-savvy-green/10 active:scale-95 transition-all duration-100"
              style={{ boxShadow: "0 2px 6px 0 rgba(70,70,120,0.08)" }}
            >
              Upgrade
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 mt-3 border-t border-gray-100 bg-transparent">
          <div className="flex gap-5 justify-center">
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">Help</a>
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">Privacy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-savvy-purple transition font-medium">Terms</a>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default PopupPreview;
