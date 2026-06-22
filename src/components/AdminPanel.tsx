/**
 * FAIRPLAY Admin Panel
 * Accessible to authenticated users — tab 0: SEO & Social Share
 *
 * Meta tags in index.html are static (required for bots).
 * This panel lets admins edit the *Supabase app_settings* record that
 * acts as the source of truth and reminds them to redeploy to push
 * changes live to crawlers.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

const SITE_URL = 'https://fairplay-pearl.vercel.app';

interface SeoSettings {
  site_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_handle: string;
  canonical_url: string;
}

const DEFAULTS: SeoSettings = {
  site_title:       'FAIRPLAY — The Referee Engine for the Beautiful Game',
  meta_description: 'FAIRPLAY is the referee app for everyone. Call every foul, card and restart live on any match. Compare your decisions with fans worldwide. Follow every league in 20 languages — free forever.',
  meta_keywords:    'soccer referee app, football referee, live match calls, referee engine, football app, soccer app, compare referee calls, football leagues, FIFA World Cup, Premier League referee',
  og_title:         'FAIRPLAY — The Referee Engine for the Beautiful Game',
  og_description:   'Call every foul, card & restart live. Compare with fans worldwide. Every league on the planet — free, in 20 languages.',
  og_image:         `${SITE_URL}/og-image.png`,
  twitter_handle:   '@fairplay_app',
  canonical_url:    `${SITE_URL}/`,
};

type AdminTab = 'seo' | 'thumbnail';

export default function AdminPanel({ onClose }: Props) {
  const [tab, setTab] = useState<AdminTab>('seo');
  const [settings, setSettings] = useState<SeoSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState('');

  /* ── Load from Supabase app_settings ─────────────────────────── */
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'seo')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          setSettings({ ...DEFAULTS, ...(data.value as Partial<SeoSettings>) });
        }
      });
  }, []);

  /* ── Save to Supabase ─────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    if (supabase) {
      await supabase
        .from('app_settings')
        .upsert({ key: 'seo', value: settings }, { onConflict: 'key' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /* ── Copy helper ─────────────────────────────────────────────── */
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(''), 1600);
  };

  const input = (
    label: string,
    key: keyof SeoSettings,
    rows = 1,
    hint?: string,
  ) => (
    <div key={key}>
      <div className="flex items-center justify-between mb-1">
        <label style={{ fontSize: 'clamp(9px,1.1vw,11px)', color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </label>
        <button
          className="call-btn"
          style={{ fontSize: 10, color: 'rgba(0,212,255,0.5)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(0,212,255,0.15)' }}
          onClick={() => copy(settings[key], key)}
        >
          {copied === key ? '✓ copied' : 'copy'}
        </button>
      </div>
      {rows === 1 ? (
        <input
          type="text"
          value={settings[key]}
          onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 'clamp(12px,1.5vw,14px)', outline: 'none',
          }}
        />
      ) : (
        <textarea
          rows={rows}
          value={settings[key]}
          onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 'clamp(12px,1.5vw,14px)',
            outline: 'none', resize: 'vertical' as const,
          }}
        />
      )}
      {hint && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 3 }}>{hint}</div>
      )}
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 680,
          background: 'linear-gradient(180deg,#111827,#0d1117)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          maxHeight: '92dvh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 12px' }}>
          <div>
            <div style={{ fontSize: 'clamp(13px,1.8vw,17px)', fontWeight: 900, color: '#00d4ff', letterSpacing: '0.08em' }}>
              ⚙️ ADMIN SETTINGS
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              SEO · Social Share · Thumbnail
            </div>
          </div>
          <button
            className="call-btn"
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}
            onClick={onClose}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px' }}>
          {([['seo', '🔍 SEO & META'], ['thumbnail', '🖼️ SHARE PREVIEW']] as [AdminTab, string][]).map(([id, label]) => (
            <button
              key={id}
              className="call-btn"
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 'clamp(10px,1.3vw,12px)',
                fontWeight: 900, letterSpacing: '0.05em',
                background: tab === id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${tab === id ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: tab === id ? '#00d4ff' : 'rgba(255,255,255,0.35)',
              }}
              onClick={() => setTab(id)}
            >{label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="scrollable" style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── SEO TAB ────────────────────────────────────────────── */}
          {tab === 'seo' && (
            <>
              {/* Deploy warning */}
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.2)', fontSize: 'clamp(10px,1.3vw,12px)', color: 'rgba(255,200,0,0.7)', lineHeight: 1.5 }}>
                ⚠️ &nbsp;Meta tags that bots &amp; crawlers read are baked into <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>index.html</code>. Saving here updates the database — to push changes to Google/WhatsApp/Twitter, update <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>index.html</code> and redeploy.
              </div>

              {/* Basic SEO */}
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(0,212,255,0.5)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: 4 }}>
                Basic SEO
              </div>
              {input('Page title (shown in browser tab & Google)', 'site_title', 1, 'Ideal length: 50–60 characters')}
              {input('Meta description (shown in Google search results)', 'meta_description', 3, 'Ideal length: 150–160 characters')}
              {input('Keywords (comma-separated)', 'meta_keywords', 2)}
              {input('Canonical URL', 'canonical_url', 1)}

              {/* Open Graph */}
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(0,212,255,0.5)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: 4 }}>
                Open Graph — Facebook · WhatsApp · LinkedIn · iMessage
              </div>
              {input('OG Title', 'og_title', 1, 'Shown when someone shares a link')}
              {input('OG Description', 'og_description', 2)}
              {input('OG Image URL', 'og_image', 1, 'Must be an absolute URL to a PNG/JPG (1200×630 px recommended)')}

              {/* Twitter / X */}
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(0,212,255,0.5)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', paddingTop: 4 }}>
                Twitter / X
              </div>
              {input('Twitter handle', 'twitter_handle', 1, 'e.g. @fairplay_app')}

              {/* Generated snippet */}
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 'clamp(9px,1.1vw,11px)', color: 'rgba(255,255,255,0.38)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  index.html snippet (copy → paste to deploy)
                </div>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '12px 14px', fontSize: 11,
                    color: 'rgba(255,255,255,0.55)', overflowX: 'auto', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  }}>{`<title>${settings.site_title}</title>
<meta name="description" content="${settings.meta_description}" />
<meta name="keywords" content="${settings.meta_keywords}" />
<link rel="canonical" href="${settings.canonical_url}" />
<meta property="og:title" content="${settings.og_title}" />
<meta property="og:description" content="${settings.og_description}" />
<meta property="og:image" content="${settings.og_image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${settings.canonical_url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${settings.twitter_handle}" />
<meta name="twitter:title" content="${settings.og_title}" />
<meta name="twitter:description" content="${settings.og_description}" />
<meta name="twitter:image" content="${settings.og_image}" />`}</pre>
                  <button
                    className="call-btn"
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
                      color: '#00d4ff',
                    }}
                    onClick={() => copy(`<title>${settings.site_title}</title>\n<meta name="description" content="${settings.meta_description}" />\n<meta name="keywords" content="${settings.meta_keywords}" />\n<link rel="canonical" href="${settings.canonical_url}" />\n<meta property="og:title" content="${settings.og_title}" />\n<meta property="og:description" content="${settings.og_description}" />\n<meta property="og:image" content="${settings.og_image}" />\n<meta property="og:url" content="${settings.canonical_url}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:site" content="${settings.twitter_handle}" />\n<meta name="twitter:image" content="${settings.og_image}" />`, 'snippet')}
                  >
                    {copied === 'snippet' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── THUMBNAIL TAB ───────────────────────────────────────── */}
          {tab === 'thumbnail' && (
            <>
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, paddingTop: 4 }}>
                This is the image that appears when the link is shared on social media. It's hosted at the URL below and baked into the HTML meta tags.
              </div>

              {/* Preview */}
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img
                  src="/og-image.png"
                  alt="Social share thumbnail"
                  style={{ width: '100%', display: 'block' }}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* URL row */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace',
                }}>
                  {settings.og_image}
                </div>
                <button
                  className="call-btn"
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', flexShrink: 0 }}
                  onClick={() => copy(settings.og_image, 'ogurl')}
                >
                  {copied === 'ogurl' ? '✓' : '📋'}
                </button>
              </div>

              {/* Specs */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {[['Dimensions', '1200 × 630 px'], ['Format', 'PNG'], ['Size', '~177 KB'], ['Aspect ratio', '1.91:1 (OG standard)']].map(([k, v]) => (
                  <div key={k} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 1 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Platform previews */}
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(0,212,255,0.5)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Platform compatibility
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['✅', 'WhatsApp', 'Large preview card'],
                  ['✅', 'iMessage / iOS', 'Large banner preview'],
                  ['✅', 'Facebook / Meta', 'Landscape card'],
                  ['✅', 'Twitter / X',  'summary_large_image card'],
                  ['✅', 'LinkedIn',     'Landscape card'],
                  ['✅', 'Telegram',     'Inline image preview'],
                  ['✅', 'Slack',        'Unfurl card'],
                  ['⚠️', 'Google Search', 'Uses screenshot — image may appear in rich results'],
                ].map(([icon, platform, note]) => (
                  <div key={platform} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
                    <span style={{ fontSize: 'clamp(12px,1.5vw,14px)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, minWidth: 120 }}>{platform}</span>
                    <span style={{ fontSize: 'clamp(11px,1.3vw,12px)', color: 'rgba(255,255,255,0.3)' }}>{note}</span>
                  </div>
                ))}
              </div>

              {/* Validator links */}
              <div style={{ fontSize: 'clamp(10px,1.2vw,12px)', color: 'rgba(0,212,255,0.5)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Test your share links
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {[
                  ['Facebook Debugger', 'https://developers.facebook.com/tools/debug/?q=https://fairplay-pearl.vercel.app/'],
                  ['Twitter Card Validator', 'https://cards-dev.twitter.com/validator'],
                  ['LinkedIn Inspector', 'https://www.linkedin.com/post-inspector/inspect/https://fairplay-pearl.vercel.app/'],
                  ['OpenGraph.xyz', 'https://www.opengraph.xyz/url/https://fairplay-pearl.vercel.app/'],
                ].map(([label, url]) => (
                  <a
                    key={label as string}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                      color: '#00d4ff', textDecoration: 'none',
                    }}
                  >
                    {label as string} ↗
                  </a>
                ))}
              </div>
            </>
          )}

          <div style={{ height: 12 }}/>
        </div>

        {/* Footer — save button */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="call-btn"
            style={{
              flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 900,
              fontSize: 'clamp(12px,1.6vw,14px)', letterSpacing: '0.05em',
              background: saved ? 'rgba(0,255,136,0.12)' : 'rgba(0,212,255,0.12)',
              border: `1px solid ${saved ? 'rgba(0,255,136,0.4)' : 'rgba(0,212,255,0.35)'}`,
              color: saved ? '#00ff88' : '#00d4ff',
            }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '⏳ Saving…' : saved ? '✅ Saved to database' : '💾 SAVE TO DATABASE'}
          </button>
          <button
            className="call-btn"
            style={{ padding: '12px 16px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
            onClick={onClose}
          >Close</button>
        </div>
      </div>
    </div>
  );
}
