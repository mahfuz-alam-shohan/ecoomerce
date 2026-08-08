'use client';

import React, { useState } from 'react';
import { Product, Variant, ThemeConfig } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { ShoppingCart, CheckCircle, Star, Share2, MessageCircle, AlertCircle } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  themeConfig?: ThemeConfig;
  currencySymbol?: string;
}

export function ProductDetailView({ product, currencySymbol = 'BDT ' }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] || null);
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const price = selectedVariant
    ? (selectedVariant.priceInCents / 100).toFixed(2)
    : (product.minPriceInCents / 100).toFixed(2);

  const compareAt = selectedVariant?.compareAtPriceInCents
    ? (selectedVariant.compareAtPriceInCents / 100).toFixed(2)
    : product.variants?.[0]?.compareAtPriceInCents
    ? (product.variants[0].compareAtPriceInCents / 100).toFixed(2)
    : null;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.totalStock;
  const isSoldOut = currentStock <= 0;

  const handleAddToCart = () => {
    if (isSoldOut) return;

    addItem({
      variantId: selectedVariant?.id || product.id,
      productId: product.id,
      title: selectedVariant ? `${product.title} (${selectedVariant.title})` : product.title,
      sku: selectedVariant?.sku || product.handle || 'N/A',
      priceInCents: selectedVariant?.priceInCents || product.minPriceInCents,
      imageUrl: selectedImage,
      quantity,
      maxStock: currentStock,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
      {/* Col 1: Product Image Box (Exact RoboticsBD white bordered card) */}
      <div className="space-y-3">
        <div className="relative aspect-square w-full overflow-hidden border border-gray-300 rounded bg-white p-4 flex items-center justify-center shadow-xs">
          <img
            src={selectedImage}
            alt={product.title}
            className="w-full h-full object-contain object-center"
          />

          {compareAt && !isSoldOut && (
            <div className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded shadow-xs">
              Reduced price
            </div>
          )}
        </div>

        {/* Thumbnail Selector Strip */}
        {product.images && product.images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border bg-white p-1 transition-all ${
                  selectedImage === imgUrl ? 'border-sky-500 shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="Thumbnail" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Col 2: Product Specifications & Purchase Box (Exact RoboticsBD right side) */}
      <div className="flex flex-col space-y-4">
        <div className="space-y-2 border-b border-gray-200 pb-4">
          <h1 className="text-lg sm:text-2xl font-black text-gray-900 leading-snug">
            {product.title}
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
            <span>
              Reference: <span className="text-gray-900 font-mono font-bold">{selectedVariant?.sku || 'RBD-3255'}</span>
            </span>
            <span>
              Brand: <span className="text-gray-900 font-bold uppercase">{product.title.split(' ')[0] || 'ROBOTICS'}</span>
            </span>
          </div>
        </div>

        {/* Bullet Points Overview (RoboticsBD style) */}
        <div className="text-xs sm:text-sm text-gray-700 space-y-1.5 leading-relaxed whitespace-pre-line border-b border-gray-200 pb-4">
          {product.description || `• High performance verified electronics component.
• Built for industrial robotics and IoT automation applications.
• Standard operating input voltage and interface compatibility.
• Backed by full replacement warranty against factory defects.`}
        </div>

        {/* Price & Countdown Timer Strip */}
        <div className="space-y-3 border-b border-gray-200 pb-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-red-600">
              {currencySymbol}{price}
            </span>
            {compareAt && (
              <span className="text-base text-gray-400 line-through font-bold">
                {currencySymbol}{compareAt}
              </span>
            )}
            {compareAt && (
              <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded">
                Save {currencySymbol}{((Number(compareAt) - Number(price))).toFixed(0)}
              </span>
            )}
          </div>

          {/* Discount Countdown Strip (Like RoboticsBD orange timer) */}
          {compareAt && (
            <div className="bg-orange-50 border border-orange-200 rounded p-2.5 flex items-center justify-between text-xs">
              <span className="font-extrabold text-orange-900 italic">Discount Ends In:</span>
              <div className="flex items-center gap-1 font-mono font-black text-white">
                <span className="bg-slate-900 px-1.5 py-1 rounded text-center min-w-[28px]">00</span>
                <span className="text-slate-900">:</span>
                <span className="bg-slate-900 px-1.5 py-1 rounded text-center min-w-[28px]">02</span>
                <span className="text-slate-900">:</span>
                <span className="bg-slate-900 px-1.5 py-1 rounded text-center min-w-[28px]">13</span>
                <span className="text-slate-900">:</span>
                <span className="bg-slate-900 px-1.5 py-1 rounded text-center min-w-[28px]">12</span>
              </div>
            </div>
          )}

          {/* Star Rating Strip */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-gray-800">Read the review</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Average rating: 5 /5 (1 review)</span>
          </div>
        </div>

        {/* Variant Selector Options if applicable */}
        {variants.length > 1 && (
          <div className="space-y-2 pt-1 border-b border-gray-200 pb-4">
            <label className="text-xs font-bold uppercase text-gray-700 block">Select Variant Option:</label>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                    selectedVariant?.id === v.id
                      ? 'border-[#82c91e] bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Input Box & Add to Cart Button (Exact RoboticsBD green button) */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-800">Quantity</span>

            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden w-24">
              <input
                type="text"
                readOnly
                value={quantity}
                className="w-12 text-center font-bold text-sm text-gray-900 border-r border-gray-300 py-1.5 focus:outline-none"
              />
              <div className="flex flex-col w-12 bg-gray-50">
                <button
                  onClick={() => setQuantity((prev) => Math.min(currentStock, prev + 1))}
                  disabled={isSoldOut}
                  className="h-4 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200 border-b border-gray-300"
                >
                  ▲
                </button>
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={isSoldOut}
                  className="h-4 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-200"
                >
                  ▼
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="flex-1 bg-[#82c91e] hover:bg-[#74b81b] text-white font-black text-sm px-6 py-3 rounded shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isSoldOut ? 'Sold Out' : 'Add to cart'}</span>
            </button>
          </div>

          {addedSuccess && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Successfully added {quantity} x {product.title} to cart!</span>
            </div>
          )}
        </div>

        {/* Recent Purchases Activity indicator */}
        <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <span className="text-orange-600 font-black">🔥 12 people</span> have purchased this item recently
          </p>
          <p className="flex items-center gap-1">
            <span className="text-red-600 font-black">⚡ 511 people</span> added this item to the cart in last 10 days
          </p>
        </div>
      </div>
    </div>
  );
}
