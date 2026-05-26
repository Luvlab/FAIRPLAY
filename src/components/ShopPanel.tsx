import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  tag: string;
  color: string;
  category: 'apparel' | 'accessories' | 'prints';
  customizable: boolean;
  sizes?: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'jersey-ref',
    name: 'FAIRPLAY Referee Jersey',
    description: 'Breathable performance jersey with FAIRPLAY branding. Professional cut, moisture-wicking fabric.',
    price: 49.99,
    emoji: '👕',
    tag: 'BESTSELLER',
    color: '#00d4ff',
    category: 'apparel',
    customizable: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'hoodie',
    name: 'FAIRPLAY Hoodie',
    description: 'Premium heavyweight hoodie. Embroidered ⚽ logo. Perfect for match days.',
    price: 64.99,
    emoji: '🧥',
    tag: 'NEW',
    color: '#aa88ff',
    category: 'apparel',
    customizable: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'cap',
    name: 'FAIRPLAY Snapback Cap',
    description: 'Structured 6-panel cap with embroidered logo. One size fits all.',
    price: 29.99,
    emoji: '🧢',
    tag: '',
    color: '#00ff88',
    category: 'accessories',
    customizable: false,
  },
  {
    id: 'stickers',
    name: 'Referee Sticker Pack',
    description: '8 premium die-cut stickers. Cards, whistles, pitch diagrams. Weatherproof vinyl.',
    price: 9.99,
    emoji: '🏷️',
    tag: '8-PACK',
    color: '#FFD700',
    category: 'accessories',
    customizable: false,
  },
  {
    id: 'phone-case',
    name: 'FAIRPLAY Phone Case',
    description: 'Impact-resistant case with FAIRPLAY pitch design. iPhone & Android.',
    price: 24.99,
    emoji: '📱',
    tag: '',
    color: '#ff8800',
    category: 'accessories',
    customizable: false,
  },
  {
    id: 'poster',
    name: 'Match Poster (A3)',
    description: 'Generate a custom poster from your match timeline. Premium print on 200gsm matte.',
    price: 19.99,
    emoji: '🖼️',
    tag: 'CUSTOM',
    color: '#ff69b4',
    category: 'prints',
    customizable: true,
  },
  {
    id: 'whistle-premium',
    name: 'Pro Referee Whistle',
    description: 'Stainless steel pea-less whistle. Loud, clear tone. Official weight & feel.',
    price: 14.99,
    emoji: '📯',
    tag: '',
    color: '#FFD700',
    category: 'accessories',
    customizable: false,
  },
  {
    id: 'tee-fan',
    name: 'Fan Referee Tee',
    description: 'Soft 100% cotton tee. "I saw that" slogan. Unisex fit.',
    price: 34.99,
    emoji: '👕',
    tag: 'FAN FAV',
    color: '#ff4444',
    category: 'apparel',
    customizable: false,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
];

const CATEGORIES = ['All', 'Apparel', 'Accessories', 'Prints'] as const;
type Category = typeof CATEGORIES[number];

interface CartItem { product: Product; size?: string; qty: number; }

export default function ShopPanel() {
  const [category, setCategory] = useState<Category>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [view, setView] = useState<'shop' | 'cart'>('shop');

  const filtered = PRODUCTS.filter((p) =>
    category === 'All' || p.category === category.toLowerCase()
  );

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  const addToCart = (product: Product, size?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      if (existing) return prev.map((i) => i.product.id === product.id && i.size === size ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, size, qty: 1 }];
    });
    setSelected(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`nav-tab ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'All' ? '🛒 ALL' : c === 'Apparel' ? '👕 APPAREL' : c === 'Accessories' ? '🎁 ACCESSORIES' : '🖼️ PRINTS'}
            </button>
          ))}
        </div>
        <button
          className="ml-auto call-btn px-3 py-1.5 rounded-lg font-bold relative"
          style={{
            background: totalItems > 0 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${totalItems > 0 ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: totalItems > 0 ? '#00d4ff' : 'rgba(255,255,255,0.4)',
            fontSize: 'clamp(10px, 1.3vw, 13px)',
          }}
          onClick={() => setView(view === 'cart' ? 'shop' : 'cart')}
        >
          🛒 {totalItems > 0 ? `(${totalItems}) €${totalPrice.toFixed(2)}` : 'Cart'}
        </button>
      </div>

      {/* Cart View */}
      {view === 'cart' && (
        <div className="flex-1 scrollable px-3 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/30 gap-3">
              <div className="text-5xl">🛒</div>
              <div className="text-sm">Your cart is empty</div>
              <button
                className="call-btn px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff' }}
                onClick={() => setView('shop')}
              >
                Browse Merch
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="text-3xl">{item.product.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{item.product.name}</div>
                    <div className="text-white/40 text-xs">{item.size ? `Size: ${item.size} · ` : ''}Qty: {item.qty}</div>
                  </div>
                  <div className="font-bold text-sm" style={{ color: '#00d4ff' }}>€{(item.qty * item.product.price).toFixed(2)}</div>
                  <button
                    className="call-btn text-white/30 text-lg w-7 h-7 flex items-center justify-center rounded"
                    onClick={() => setCart((p) => p.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <div className="flex justify-between font-black text-base mb-3">
                  <span>Total</span>
                  <span style={{ color: '#00d4ff' }}>€{totalPrice.toFixed(2)}</span>
                </div>
                <button
                  className="w-full py-3 rounded-xl font-bold call-btn"
                  style={{ background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}
                  onClick={() => window.open('https://printful.com', '_blank')}
                >
                  🚀 Checkout via Printful
                </button>
                <div className="text-white/25 text-xs text-center mt-2">
                  Fulfilled by Printful · Ships worldwide · 2–5 day delivery
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shop View */}
      {view === 'shop' && (
        <div className="flex-1 scrollable px-3 py-3">
          {/* POD banner */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(170,136,255,0.05))', border: '1px solid rgba(0,212,255,0.15)' }}
          >
            <span className="text-2xl">🖨️</span>
            <div>
              <div className="font-bold text-sm">Print on Demand</div>
              <div className="text-white/40 text-xs">Printed & shipped fresh by Printful · No minimums · Worldwide delivery</div>
            </div>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 40vw, 200px), 1fr))' }}>
            {filtered.map((product) => (
              <button
                key={product.id}
                className="call-btn rounded-xl overflow-hidden text-left"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onClick={() => { setSelected(product); setSelectedSize(product.sizes?.[1] ?? ''); }}
              >
                {/* Product image area */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{
                    aspectRatio: '1',
                    background: `linear-gradient(135deg, ${product.color}15, ${product.color}08)`,
                    borderBottom: `1px solid ${product.color}22`,
                  }}
                >
                  <span style={{ fontSize: 'clamp(40px, 8vw, 64px)' }}>{product.emoji}</span>
                </div>

                <div className="p-2.5">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="font-bold leading-tight" style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }}>
                      {product.name}
                    </div>
                    {product.tag && (
                      <span
                        className="font-bold flex-shrink-0 px-1.5 py-0.5 rounded"
                        style={{ background: `${product.color}22`, color: product.color, fontSize: 9 }}
                      >
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div className="font-black mt-1" style={{ color: product.color, fontSize: 'clamp(13px, 1.8vw, 16px)' }}>
                    €{product.price.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-md rounded-t-3xl md:rounded-2xl p-5"
            style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85dvh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div
                className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center mb-3"
                style={{ background: `${selected.color}18`, border: `1px solid ${selected.color}33` }}
              >
                <span style={{ fontSize: 48 }}>{selected.emoji}</span>
              </div>
              {selected.tag && (
                <span
                  className="font-bold px-2 py-0.5 rounded text-xs mb-2 inline-block"
                  style={{ background: `${selected.color}22`, color: selected.color }}
                >
                  {selected.tag}
                </span>
              )}
              <div className="font-black text-lg">{selected.name}</div>
              <div className="text-white/50 text-sm mt-1">{selected.description}</div>
            </div>

            {selected.sizes && (
              <div className="mb-4">
                <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Size</div>
                <div className="flex gap-2 flex-wrap">
                  {selected.sizes.map((s) => (
                    <button
                      key={s}
                      className="call-btn px-3 py-1.5 rounded-lg font-bold text-sm"
                      style={selectedSize === s
                        ? { background: `${selected.color}22`, border: `1px solid ${selected.color}`, color: selected.color }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }
                      }
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="font-black text-2xl" style={{ color: selected.color }}>€{selected.price.toFixed(2)}</div>
              <div className="text-white/30 text-xs">Free shipping over €80</div>
            </div>

            <button
              className="w-full py-3 rounded-xl font-bold call-btn"
              style={{ background: `${selected.color}22`, border: `1px solid ${selected.color}55`, color: selected.color }}
              onClick={() => addToCart(selected, selected.sizes ? selectedSize : undefined)}
            >
              🛒 Add to Cart
            </button>
            <button
              className="w-full py-2 mt-2 rounded-xl font-bold call-btn text-white/30 text-sm"
              onClick={() => setSelected(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
