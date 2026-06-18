import { useState, useEffect } from 'react';

interface Listing {
  id: string;
  title: string;
  category: 'boots' | 'jersey' | 'ball' | 'kit' | 'other';
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  description: string;
  contact: string;
  userId: string;
}

const DEMO_LISTINGS: Listing[] = [
  { id: 'd1', title: 'Nike Mercurial Vapor 15 — Size 42', category: 'boots',  price: 65, condition: 'like-new', description: 'Worn 3 times, indoor FG. Blue/gold.',       contact: 'boots@example.com',  userId: 'demo' },
  { id: 'd2', title: 'Adidas home jersey #10 — M',          category: 'jersey', price: 25, condition: 'good',     description: 'Official club jersey, washed once.',     contact: 'jersey@example.com', userId: 'demo' },
  { id: 'd3', title: 'Match ball — Adidas Finale',           category: 'ball',   price: 40, condition: 'good',     description: 'Used one season, still great.',          contact: 'ball@example.com',   userId: 'demo' },
  { id: 'd4', title: 'Full goalkeeper kit — L',              category: 'kit',    price: 55, condition: 'new',      description: 'Never worn, includes gloves.',            contact: 'kit@example.com',    userId: 'demo' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  boots: '👟',
  jersey: '👕',
  ball: '⚽',
  kit: '🥅',
  other: '📦',
};

const CONDITION_COLOR: Record<string, string> = {
  new: '#00ff88',
  'like-new': '#00d4ff',
  good: '#ffdd00',
  fair: '#ff8800',
};

const LS_KEY = 'fp_market_listings';

const FAIRPLAY_MERCH = [
  // Safe tier
  { id: 's1', tier: 'safe',  slogan: 'WELCOME TO THE MODERN COLOSSEUM',               item: 'Heavyweight Tee', price: '€32', emoji: '👕' },
  { id: 's2', tier: 'safe',  slogan: 'THE BALL IS FREE. EVERYTHING ELSE IS FOR SALE.',item: 'Hoodie',          price: '€58', emoji: '🧥' },
  // Sharp tier
  { id: 'h1', tier: 'sharp', slogan: 'THE STADIUM ROARS. THE HOUSE ALWAYS WINS.',     item: 'Cap',             price: '€28', emoji: '🧢' },
  { id: 'h2', tier: 'sharp', slogan: 'A GOAL FOR THE NATION. A WAGE FOR A CONTINENT.',item: 'Tee',             price: '€32', emoji: '👕' },
  // Spicy tier
  { id: 'p1', tier: 'spicy', slogan: "WIN AND I'M FRENCH. LOSE AND I'M AFRICAN.",     item: 'Tee',             price: '€32', emoji: '👕' },
  { id: 'p2', tier: 'spicy', slogan: '700 GAMBLING ADS PER MATCH. THE KIDS WERE WATCHING.', item: 'Hoodie',   price: '€58', emoji: '🧥' },
] as const;

function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Listing[]) : [];
  } catch {
    return [];
  }
}

function saveListings(listings: Listing[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(listings));
}

interface FormState {
  title: string;
  price: string;
  category: Listing['category'];
  condition: Listing['condition'];
  description: string;
  contact: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  price: '',
  category: 'boots',
  condition: 'good',
  description: '',
  contact: '',
};

export default function MarketPanel() {
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = loadListings();
    return [...DEMO_LISTINGS, ...saved];
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Sync user listings from localStorage (excluding demos)
  useEffect(() => {
    const saved = loadListings();
    setListings([...DEMO_LISTINGS, ...saved]);
  }, []);

  function handleSubmit() {
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { setFormError('Enter a valid price.'); return; }
    if (!form.contact.trim()) { setFormError('Contact info is required.'); return; }

    const newListing: Listing = {
      id: `u_${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      condition: form.condition,
      description: form.description.trim(),
      contact: form.contact.trim(),
      userId: 'local',
    };

    const saved = loadListings();
    const updated = [newListing, ...saved];
    saveListings(updated);
    setListings([...DEMO_LISTINGS, ...updated]);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'clamp(8px, 1.2vw, 12px) clamp(10px, 1.5vw, 14px)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 'clamp(12px, 1.6vw, 15px)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 'clamp(10px, 1.3vw, 12px)',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: '#0d1117',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(16px, 3vw, 32px)', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 4vw, 40px)' }}>

        {/* ── Section A: Classifieds ── */}
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(12px, 2vw, 20px)' }}>
            <div>
              <div style={{ fontSize: 'clamp(10px, 1.4vw, 12px)', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>
                CLASSIFIEDS
              </div>
              <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3.5vw, 28px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                ⚽ Gear Marketplace
              </h2>
            </div>
            <button
              onClick={() => { setShowForm(true); setFormError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 'clamp(8px, 1.2vw, 12px) clamp(12px, 2vw, 20px)',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#0d1117',
                fontSize: 'clamp(10px, 1.4vw, 13px)',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              + POST LISTING
            </button>
          </div>

          {/* Listings grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 'clamp(10px, 1.5vw, 16px)' }}>
            {listings.map((item) => (
              <div
                key={item.id}
                style={{
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: 'clamp(12px, 2vw, 18px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Category emoji + title */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', lineHeight: 1, flexShrink: 0 }}>
                    {CATEGORY_EMOJI[item.category] ?? '📦'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'clamp(12px, 1.7vw, 15px)', fontWeight: 700, color: '#fff', lineHeight: 1.3, wordBreak: 'break-word' }}>
                      {item.title}
                    </div>
                  </div>
                </div>

                {/* Price + condition badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 'clamp(13px, 2vw, 17px)',
                      fontWeight: 900,
                      color: '#00d4ff',
                    }}
                  >
                    €{item.price}
                  </span>
                  <span
                    style={{
                      fontSize: 'clamp(9px, 1.2vw, 11px)',
                      fontWeight: 700,
                      color: CONDITION_COLOR[item.condition] ?? '#fff',
                      background: `${CONDITION_COLOR[item.condition] ?? '#fff'}18`,
                      border: `1px solid ${CONDITION_COLOR[item.condition] ?? '#fff'}33`,
                      padding: '2px 8px',
                      borderRadius: 99,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {item.condition}
                  </span>
                </div>

                {/* Description */}
                {item.description && (
                  <p style={{ margin: 0, fontSize: 'clamp(11px, 1.4vw, 13px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>
                )}

                {/* Contact button */}
                <a
                  href={
                    item.contact.includes('@')
                      ? `mailto:${item.contact}`
                      : `https://wa.me/${item.contact.replace(/\D/g, '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 4,
                    padding: 'clamp(6px, 1vw, 10px)',
                    borderRadius: 8,
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    color: '#00d4ff',
                    fontSize: 'clamp(10px, 1.3vw, 12px)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                >
                  {item.contact.includes('@') ? '✉️' : '💬'} Contact Seller
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section B: Official FAIRPLAY Store ── */}
        <div
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,255,136,0.03))',
            border: '1px solid rgba(0,212,255,0.15)',
            padding: 'clamp(20px, 3vw, 32px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Store header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: 1, marginBottom: 8 }}>🛒</div>
            <div style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', fontWeight: 900, color: '#fff' }}>
              FAIRPLAY Official Store
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 'clamp(12px, 1.6vw, 15px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              Provocation merch. Printed &amp; shipped worldwide via Printful.
            </p>
          </div>

          {/* Merch grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
              gap: 'clamp(8px, 1.2vw, 14px)',
            }}
          >
            {FAIRPLAY_MERCH.map((m) => {
              const tierColor = m.tier === 'safe' ? '#00ff88' : m.tier === 'sharp' ? '#ffaa00' : '#ff4444';
              const tierLabel = m.tier === 'safe' ? 'SAFE' : m.tier === 'sharp' ? 'SHARP' : 'SPICY';
              return (
                <div
                  key={m.id}
                  style={{
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderLeft: `3px solid ${tierColor}`,
                    padding: 'clamp(10px, 1.5vw, 16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Tier badge */}
                  <div>
                    <span
                      style={{
                        fontSize: 'clamp(9px, 1.2vw, 11px)',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: tierColor,
                        background: `${tierColor}18`,
                        border: `1px solid ${tierColor}33`,
                        padding: '2px 8px',
                        borderRadius: 99,
                        textTransform: 'uppercase',
                      }}
                    >
                      {tierLabel}
                    </span>
                  </div>

                  {/* Slogan */}
                  <div
                    style={{
                      fontSize: 'clamp(11px, 1.5vw, 14px)',
                      fontWeight: 900,
                      color: '#fff',
                      lineHeight: 1.4,
                      letterSpacing: '0.02em',
                      flexGrow: 1,
                    }}
                  >
                    {m.slogan}
                  </div>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', lineHeight: 1 }}>{m.emoji}</span>
                    <span style={{ fontSize: 'clamp(10px, 1.3vw, 12px)', color: 'rgba(255,255,255,0.4)', flex: 1, minWidth: 0 }}>
                      {m.item}
                    </span>
                    <span style={{ fontSize: 'clamp(13px, 1.8vw, 16px)', fontWeight: 900, color: '#00d4ff', flexShrink: 0 }}>
                      {m.price}
                    </span>
                    <button
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: 'transparent',
                        border: '1px solid rgba(255,120,0,0.45)',
                        color: '#ff8833',
                        fontSize: 'clamp(9px, 1.2vw, 11px)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        flexShrink: 0,
                      }}
                    >
                      PRE-ORDER
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Browse Store button */}
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: 'clamp(10px, 1.5vw, 14px) clamp(20px, 3vw, 32px)',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#0d1117',
                fontSize: 'clamp(12px, 1.6vw, 15px)',
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 24px rgba(0,212,255,0.2)',
              }}
            >
              Browse Store →
            </button>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>

      {/* ── Post Listing Bottom Sheet ── */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setFormError(''); } }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 560,
              margin: '0 auto',
              background: '#12181f',
              borderRadius: '20px 20px 0 0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              padding: 'clamp(20px, 3vw, 32px)',
              maxHeight: '90dvh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Sheet header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 900, color: '#fff' }}>
                Post a Listing
              </div>
              <button
                onClick={() => { setShowForm(false); setFormError(''); }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Title</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Nike Phantom GT2 — Size 44"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Price */}
              <div>
                <label style={labelStyle}>Price (€)</label>
                <input
                  style={inputStyle}
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {/* Category + Condition row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Listing['category'] })}
                  >
                    <option value="boots">👟 Boots</option>
                    <option value="jersey">👕 Jersey</option>
                    <option value="ball">⚽ Ball</option>
                    <option value="kit">🥅 Kit</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Condition</label>
                  <select
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value as Listing['condition'] })}
                  >
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                  placeholder="Describe the item..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Contact */}
              <div>
                <label style={labelStyle}>Contact (WhatsApp number or email)</label>
                <input
                  style={inputStyle}
                  placeholder="you@example.com or +351912345678"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>

              {formError && (
                <div style={{ fontSize: 'clamp(11px, 1.4vw, 13px)', color: '#ff4444', background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                  {formError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                style={{
                  width: '100%',
                  padding: 'clamp(12px, 1.8vw, 16px)',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                  color: '#0d1117',
                  fontSize: 'clamp(13px, 1.8vw, 16px)',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                Post Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
