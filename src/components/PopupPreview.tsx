
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import React from "react";

type PopupPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PopupPreview: React.FC<PopupPreviewProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-xs w-[340px] p-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-[#8B5CF6] text-white w-8 h-8 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="9"></circle>
                <path d="M7.5 7.5a2.5 2.5 0 0 1 4.86.83c0 1.62-2.5 2.5-2.5 2.5"></path>
                <line x1="10" y1="15" x2="10.01" y2="15"></line>
              </svg>
            </div>
            <h1 className="text-base font-semibold">Savvy Shop Whisper</h1>
            <span className="ml-1 bg-[#8B5CF61A] text-[#8B5CF6] text-[10px] font-semibold px-2 py-1 rounded-full">BETA</span>
          </div>
          <div className="bg-[#8B5CF6] text-white text-xs font-semibold px-3 py-1 rounded">Free Trial</div>
        </header>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {/* Enable toggle */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold mb-1">Enable Extension</h2>
              <p className="text-xs text-gray-500">Show overlay while browsing products</p>
            </div>
            {/* Fake toggle */}
            <span className="relative inline-block w-12 align-middle select-none">
              <input type="checkbox" checked readOnly className="sr-only" />
              <span className="block w-12 h-6 bg-gray-200 rounded-full shadow-inner"></span>
              <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition translate-x-6" style={{ left: 30 }}></span>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full border border-gray-200" />
            </span>
          </div>

          {/* Prioritize section */}
          <div className="mb-5">
            <h2 className="text-sm font-semibold mb-2">Prioritize Results By</h2>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 cursor-pointer text-sm">
                <input type="radio" name="prioritize" className="mr-2 accent-[#8B5CF6]" />
                Lowest Price
              </label>
              <label className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 cursor-pointer text-sm">
                <input type="radio" name="prioritize" className="mr-2 accent-[#8B5CF6]" />
                Best Reviews
              </label>
              <label className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 cursor-pointer text-sm">
                <input type="radio" name="prioritize" className="mr-2 accent-[#8B5CF6]" />
                Fast Shipping
              </label>
              <label className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 cursor-pointer text-sm">
                <input type="radio" name="prioritize" className="mr-2 accent-[#8B5CF6]" defaultChecked />
                Balanced
              </label>
            </div>
          </div>

          {/* Display Options */}
          <div className="mb-5">
            <h2 className="text-sm font-semibold mb-2">Display Options</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2 accent-[#8B5CF6]" defaultChecked />
                Show Trust Scores
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2 accent-[#8B5CF6]" defaultChecked />
                Show Alternative Products
              </label>
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2 accent-[#8B5CF6]" defaultChecked />
                Notify on Price Drops
              </label>
            </div>
          </div>

          {/* Trial Banner */}
          <div className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white flex justify-between items-center p-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold">Your Free Trial</h3>
              <p className="text-xs opacity-90"><span className="font-bold">7</span> days remaining</p>
            </div>
            <button
              className="bg-white text-[#8B5CF6] rounded-md px-4 py-1.5 text-xs font-bold hover:shadow"
              style={{ boxShadow: "0 2px 6px 0 rgba(70,70,120,0.08)" }}
            >
              Upgrade
            </button>
          </div>
        </div>
        <footer className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex gap-4 justify-center">
            <a href="#" className="text-xs text-gray-500 hover:text-[#8B5CF6]">Help</a>
            <a href="#" className="text-xs text-gray-500 hover:text-[#8B5CF6]">Privacy</a>
            <a href="#" className="text-xs text-gray-500 hover:text-[#8B5CF6]">Terms</a>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
};

export default PopupPreview;
