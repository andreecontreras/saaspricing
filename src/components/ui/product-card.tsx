
import React from 'react'
import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  price: number | string
  image?: string
  seller?: string
  rating?: number
  advantage?: string
  url?: string
}

export const ProductCard = ({
  title,
  price,
  image,
  seller,
  rating,
  advantage,
  url,
  className,
  ...props
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer",
        className
      )}
      onClick={() => {
        if (url) {
          window.open(url, '_blank')
        }
      }}
      {...props}
    >
      <AspectRatio ratio={1}>
        <img 
          src={image || "https://via.placeholder.com/100"} 
          alt={title}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/100"
          }}
        />
      </AspectRatio>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2" title={title}>{title}</h3>
        {seller && (
          <p className="text-xs text-muted-foreground mt-1">{seller}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold">${price}</span>
          {rating && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-flex items-center">
              ★ {rating}
            </span>
          )}
        </div>
        {advantage && (
          <div className="mt-2">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              advantage.includes('price') || advantage.includes('value') ? "bg-green-100 text-green-800" :
              advantage.includes('Fast') || advantage.includes('ship') ? "bg-blue-100 text-blue-800" :
              advantage.includes('rate') || advantage.includes('review') ? "bg-yellow-100 text-yellow-800" :
              "bg-purple-100 text-purple-800"
            )}>
              {advantage}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
