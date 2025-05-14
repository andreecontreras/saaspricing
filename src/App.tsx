
import React from 'react'
import './App.css'
import { ProductCard } from './components/ui/product-card'

function App() {
  // Sample product data to showcase the components
  const products = [
    {
      title: "Wireless Noise Cancelling Headphones",
      price: 249.99,
      image: "https://via.placeholder.com/300x300?text=Headphones",
      seller: "AudioTech",
      rating: 4.7,
      advantage: "Best value",
      url: "#"
    },
    {
      title: "Smart Watch with Health Monitoring",
      price: 199.99,
      image: "https://via.placeholder.com/300x300?text=SmartWatch",
      seller: "TechGear",
      rating: 4.5,
      advantage: "Fast shipping",
      url: "#"
    },
    {
      title: "Professional Camera with 4K Video",
      price: 599.99,
      image: "https://via.placeholder.com/300x300?text=Camera",
      seller: "PhotoPro",
      rating: 4.8,
      advantage: "Top rated",
      url: "#"
    }
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Scout.io Product Showcase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            title={product.title}
            price={product.price}
            image={product.image}
            seller={product.seller}
            rating={product.rating}
            advantage={product.advantage}
            url={product.url}
          />
        ))}
      </div>
    </div>
  )
}

export default App
