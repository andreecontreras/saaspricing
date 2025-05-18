
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { ArrowDown, Star, Truck, Equal, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    reviews?: number;
    shipping?: string;
    quality?: string;
    img: string;
    tags?: string[];
  };
  priorityMode?: string;
  showTrustScore?: boolean;
  onClick?: () => void;
  className?: string;
}

const ProductCard = ({
  product,
  priorityMode = "balanced",
  showTrustScore = true,
  onClick,
  className,
}: ProductCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-shrink-0 w-36 bg-white rounded-2xl shadow ring-1 ring-purple-500/15 p-2 flex flex-col items-center transition-all hover:scale-105 hover:shadow-xl hover:bg-blue-500/10 cursor-pointer group outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      style={{ minWidth: "8.5rem" }}
    >
      <div className="w-24 h-20 rounded-xl overflow-hidden mb-2 relative">
        <AspectRatio ratio={6 / 5} className="w-full h-full">
          <img
            src={product.img}
            className="w-full h-full object-cover transition-all group-hover:brightness-90"
            alt={product.name}
          />
        </AspectRatio>
      </div>

      <div className="font-semibold text-xs text-gray-800 text-center truncate w-full mb-0.5">
        {product.name}
      </div>

      <div className="flex items-end gap-1 mb-1">
        <span className="text-purple-600 font-bold text-sm">
          ${product.price}
        </span>
        {product.oldPrice && product.oldPrice !== product.price ? (
          <span className="text-gray-400 text-xs line-through">
            ${product.oldPrice}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-center text-[11px] gap-1 text-gray-500">
        {(product.shipping?.includes("1-2") || product.shipping?.includes("1 day")) ? (
          <>
            <Truck size={13} className="text-blue-500" />
            <span>{product.shipping}</span>
          </>
        ) : priorityMode === "review" || (priorityMode === "balanced" && product.reviews && product.reviews >= 4.5) ? (
          <>
            <Star size={13} className="text-yellow-400" />
            <span>{product.reviews}</span>
          </>
        ) : priorityMode === "lowest" || (priorityMode === "balanced" && product.tags?.includes("lowest")) ? (
          <>
            <ArrowDown size={13} className="text-green-500" />
            <span>Deal!</span>
          </>
        ) : product.quality === "High" && (priorityMode === "balanced") ? (
          <>
            <Sparkles size={13} className="text-purple-500" />
            <span>Quality</span>
          </>
        ) : (
          <>
            <Equal size={13} className="text-gray-500" />
            <span>Value</span>
          </>
        )}
        {showTrustScore && (
          <span className="ml-1 text-xs bg-green-500/10 text-green-700 font-bold px-1.5 py-0.5 rounded">Trust</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
