import { useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function TimelinePanel() {
  const currentGame = useGameStore((s) => s.currentGame);
  const uploadAndAddMedia = useGameStore((s) => s.uploadAndAddMedia);
  const mediaItems = useGameStore((s) => s.mediaItems);
  const isOnline = useGameStore((s) => s.isOnline);

  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [uploadMinute, setUploadMinute] = useState(currentGame?.minute ?? 0);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [geoPos, setGeoPos] = useState<{ lat: number; lng: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const getGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeoPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoEnabled(true); },
      () => setGeoEnabled(false)
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadAndAddMedia(file, uploadMinute, caption, geoPos);
    }
    setCaption('');
    setUploading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Upload bar */}
      <div
        className="px-3 md:px-5 py-2 md:py-3 space-y-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        <div className="flex items-center gap-2">
          <button
            className="call-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold"
            style={{
              background: geoEnabled ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${geoEnabled ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: geoEnabled ? '#00ff88' : 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(10px, 1.3vw, 13px)',
            }}
            onClick={geoEnabled ? () => { setGeoEnabled(false); setGeoPos(null); } : getGeo}
          >
            📍 {geoEnabled ? `${geoPos?.lat.toFixed(4)}, ${geoPos?.lng.toFixed(4)}` : 'TAG LOCATION'}
          </button>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-white/30" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>MIN</span>
            <input
              type="number" min={0} max={120}
              value={uploadMinute}
              onChange={(e) => setUploadMinute(Number(e.target.value))}
              className="rounded px-2 py-1 text-center font-bold"
              style={{
                width: 'clamp(44px, 5vw, 56px)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                outline: 'none',
                fontSize: 'clamp(11px, 1.4vw, 14px)',
              }}
            />
          </div>
          {/* Online indicator */}
          <div className="flex items-center gap-1" style={{ color: isOnline ? '#00ff88' : '#666', fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
            <div className="rounded-full" style={{ width: 6, height: 6, background: isOnline ? '#00ff88' : '#555' }} />
            {isOnline ? 'LIVE' : 'LOCAL'}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Caption (optional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              outline: 'none',
              fontSize: 'clamp(12px, 1.5vw, 15px)',
            }}
          />
          <button
            className="call-btn px-4 py-2 rounded-lg font-bold flex-shrink-0"
            style={{
              background: 'rgba(0,212,255,0.15)',
              border: '1px solid rgba(0,212,255,0.3)',
              color: '#00d4ff',
              fontSize: 'clamp(11px, 1.4vw, 14px)',
            }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳' : '📸 UPLOAD'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Timeline */}
      <div className="flex-1 scrollable px-3 md:px-5 py-3">
        {currentGame && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-white/30 mb-2" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
              <span>0'</span>
              <span className="font-bold text-white/50">MATCH TIMELINE</span>
              <span>90'</span>
            </div>
            <div className="relative rounded-full" style={{ height: 'clamp(6px, 0.8vw, 10px)', background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${Math.min((currentGame.minute / 90) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #00d4ff, #0088ff)',
                }}
              />
              {mediaItems.map((m) => (
                <div
                  key={m.id}
                  className="absolute top-1/2 rounded-full cursor-pointer"
                  style={{
                    left: `${Math.min((m.minute / 90) * 100, 98)}%`,
                    width: 'clamp(10px, 1.5vw, 16px)',
                    height: 'clamp(10px, 1.5vw, 16px)',
                    background: m.type === 'video' ? '#ff6600' : '#00d4ff',
                    border: '2px solid rgba(0,0,0,0.5)',
                    boxShadow: `0 0 6px ${m.type === 'video' ? '#ff6600' : '#00d4ff'}`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                  title={`${m.minute}' — ${m.caption || m.type}`}
                />
              ))}
            </div>
          </div>
        )}

        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/25 text-center gap-3">
            <div style={{ fontSize: 'clamp(36px, 6vw, 56px)' }}>📹</div>
            <div style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>Upload photos & videos from the match</div>
            <div className="text-white/20" style={{ fontSize: 'clamp(10px, 1.3vw, 13px)' }}>
              Pinned to the timeline{isOnline ? ' & stored in the cloud' : ''}
            </div>
          </div>
        ) : (
          <div
            className="grid gap-2 md:gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(120px, 18vw, 200px), 1fr))' }}
          >
            {mediaItems.map((m) => (
              <div
                key={m.id}
                className="relative rounded-xl overflow-hidden cursor-pointer call-btn"
                style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)' }}
                onClick={() => setEditingItem(editingItem === m.id ? null : m.id)}
              >
                {m.type === 'image' ? (
                  <img src={m.url} alt={m.caption} className="w-full h-full object-cover" />
                ) : (
                  <video src={m.url} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(0,0,0,0.6)',
                        color: '#00d4ff',
                        fontSize: 'clamp(9px, 1.2vw, 12px)',
                      }}
                    >
                      {m.minute}'
                    </span>
                    {m.type === 'video' && <span style={{ fontSize: 'clamp(12px, 1.8vw, 18px)' }}>▶️</span>}
                  </div>
                  {m.caption && (
                    <div className="text-white/80 truncate mt-0.5" style={{ fontSize: 'clamp(9px, 1.2vw, 12px)' }}>
                      {m.caption}
                    </div>
                  )}
                </div>
                {m.location && (
                  <div
                    className="absolute top-1 right-1"
                    title={`${m.location.lat.toFixed(3)}, ${m.location.lng.toFixed(3)}`}
                    style={{ fontSize: 'clamp(12px, 1.8vw, 18px)' }}
                  >
                    📍
                  </div>
                )}
                {editingItem === m.id && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ background: 'rgba(0,0,0,0.75)' }}>
                    <button
                      className="call-btn px-3 py-1.5 rounded-lg font-bold"
                      style={{
                        background: 'rgba(255,120,0,0.3)',
                        border: '1px solid rgba(255,120,0,0.5)',
                        color: '#ff8800',
                        fontSize: 'clamp(10px, 1.3vw, 13px)',
                      }}
                    >
                      🎬 SEND TO STUDIO
                    </button>
                    <button
                      className="call-btn px-3 py-1.5 rounded-lg font-bold"
                      style={{
                        background: 'rgba(170,136,255,0.3)',
                        border: '1px solid rgba(170,136,255,0.5)',
                        color: '#aa88ff',
                        fontSize: 'clamp(10px, 1.3vw, 13px)',
                      }}
                    >
                      🔮 3D RECONSTRUCT
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
