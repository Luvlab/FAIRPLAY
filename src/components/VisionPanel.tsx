export default function VisionPanel() {
  const roadmapItems = [
    { done: true,  label: 'Live match referee calls + fan voting' },
    { done: true,  label: '20-language IP geo-detection' },
    { done: true,  label: 'Compare fan vs official calls' },
    { done: true,  label: 'Custom match timer (clubs & leagues)' },
    { done: true,  label: 'PWA — installable, works offline' },
    { done: false, label: 'Club & League Manager (community tools)' },
    { done: false, label: 'Player Performance Dashboard (public profiles)' },
    { done: false, label: 'Classified Marketplace (gear, boots, jerseys)' },
    { done: false, label: 'AI-assisted referee training courses' },
    { done: false, label: 'Real-time match notifications' },
    { done: false, label: 'Camera glasses integration (referee POV capture)' },
    { done: false, label: 'Club multi-camera upload & auto-archive' },
    { done: false, label: '360° VR Referee Vision (see below)' },
  ];

  const vrSpecs = [
    '2-camera minimum',
    '4-camera stereoscopic',
    'Live stream',
    'VR replay',
    'Official + grassroots',
  ];

  const wearableChips = [
    { icon: '👓', label: 'Referee Glasses' },
    { icon: '🎩', label: 'Smart Cap' },
    { icon: '🤳', label: 'Clip-On Cam' },
  ];

  const clubCamIcons = [
    { icon: '📱', label: 'Fixed Phone' },
    { icon: '🚁', label: 'Drone' },
    { icon: '📹', label: 'Pitch-Side Cam' },
    { icon: '🥽', label: 'VR Camera' },
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: '#0d1117',
        padding: 'clamp(16px, 3vw, 32px)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 4vw, 40px)' }}>

        {/* ── Section 1: Where FAIRPLAY is going ── */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'clamp(11px, 1.6vw, 14px)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#00d4ff',
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            🔭 VISION &amp; ROADMAP
          </div>
          <h1
            style={{
              fontSize: 'clamp(24px, 5vw, 48px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Where FAIRPLAY<br />
            <span style={{ color: '#00d4ff' }}>is going</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(13px, 1.8vw, 16px)',
              color: 'rgba(255,255,255,0.45)',
              marginTop: 12,
              lineHeight: 1.6,
              maxWidth: 520,
              margin: '12px auto 0',
            }}
          >
            We're building the world's most transparent football officiating platform — from the pitch to VR.
            Here's everything we've shipped and what's next.
          </p>
        </div>

        {/* ── Section 2: Feature Roadmap ── */}
        <div>
          <div
            style={{
              fontSize: 'clamp(10px, 1.4vw, 12px)',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(12px, 2vw, 20px)',
            }}
          >
            FEATURE ROADMAP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roadmapItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 'clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 18px)',
                  borderRadius: 12,
                  background: item.done ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${item.done ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'border-color 0.2s',
                }}
              >
                <span style={{ fontSize: 'clamp(14px, 2vw, 18px)', flexShrink: 0 }}>
                  {item.done ? '✅' : '🔜'}
                </span>
                <span
                  style={{
                    fontSize: 'clamp(12px, 1.6vw, 15px)',
                    fontWeight: 600,
                    color: item.done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </span>
                {item.done && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 'clamp(9px, 1.2vw, 11px)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#00ff88',
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.2)',
                      padding: '2px 8px',
                      borderRadius: 99,
                      flexShrink: 0,
                    }}
                  >
                    LIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: 360° VR Referee Vision ── */}
        <div
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))',
            border: '1px solid rgba(0,212,255,0.2)',
            padding: 'clamp(20px, 3vw, 36px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: 'clamp(9px, 1.2vw, 11px)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#0d1117',
                background: '#00d4ff',
                padding: '4px 12px',
                borderRadius: 99,
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              COMING SOON · SEASON 3
            </div>

            <h2
              style={{
                fontSize: 'clamp(20px, 4vw, 38px)',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 8px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              360° VR Referee Vision
            </h2>
            <div
              style={{
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontWeight: 700,
                color: '#00d4ff',
                marginBottom: 16,
              }}
            >
              See Every Angle. Call Every Play.
            </div>

            <p
              style={{
                fontSize: 'clamp(12px, 1.6vw, 15px)',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                marginBottom: 20,
                maxWidth: 600,
              }}
            >
              Holding a phone at a match is antisocial and ruins the experience for everyone around you.
              FAIRPLAY is built around <strong style={{ color: 'rgba(255,255,255,0.85)' }}>camera glasses, smart headbands, and cap-mounted cameras</strong> — lightweight wearables worn by referees and officials that capture the full 360° stereoscopic picture without anyone lifting a phone in the air.
              Start with 2 cameras (front + back) for 180° VR, evolve to 4 cameras for full stereoscopic coverage.
              Every match, every angle, streamed live and archived. Fans can replay any controversial call from the referee's exact perspective.
            </p>

            {/* Wearable chips */}
            <div
              style={{
                fontSize: 'clamp(10px, 1.3vw, 12px)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              PRIMARY CAPTURE METHODS
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {wearableChips.map((chip, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 'clamp(11px, 1.4vw, 14px)',
                    fontWeight: 700,
                    color: '#00d4ff',
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    padding: '6px 14px',
                    borderRadius: 99,
                  }}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {vrSpecs.map((spec, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 'clamp(10px, 1.3vw, 13px)',
                    fontWeight: 700,
                    color: '#00d4ff',
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    padding: '4px 12px',
                    borderRadius: 99,
                    letterSpacing: '0.05em',
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 4: Club Camera Setup ── */}
        <div
          style={{
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,255,136,0.04), rgba(0,255,136,0.01))',
            border: '1px solid rgba(0,255,136,0.15)',
            padding: 'clamp(20px, 3vw, 36px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -40,
              left: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: 'clamp(9px, 1.2vw, 11px)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#0d1117',
                background: '#00ff88',
                padding: '4px 12px',
                borderRadius: 99,
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              COMING SOON
            </div>

            <h2
              style={{
                fontSize: 'clamp(18px, 3.5vw, 32px)',
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 10px',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              CLUB CAMERA SETUP
            </h2>

            <p
              style={{
                fontSize: 'clamp(12px, 1.6vw, 15px)',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.7,
                marginBottom: 20,
                maxWidth: 600,
              }}
            >
              Clubs themselves can place a few phones on tripods, deploy a drone, or mount pitch-side cameras and VR units around the ground — then upload directly to FAIRPLAY after the match for auto-archiving and fan replay.
              <br />
              <strong style={{ color: '#00ff88' }}>No more phones in the air — let the pitch tell the story.</strong>
            </p>

            {/* Icon grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 400 }}>
              {clubCamIcons.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(0,255,136,0.05)',
                    border: '1px solid rgba(0,255,136,0.12)',
                  }}
                >
                  <span style={{ fontSize: 'clamp(18px, 2.5vw, 24px)' }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: 'clamp(11px, 1.4vw, 14px)',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 5: Share Your Vision ── */}
        <div
          style={{
            textAlign: 'center',
            padding: 'clamp(20px, 3vw, 32px)',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              fontWeight: 900,
              color: '#fff',
              marginBottom: 8,
            }}
          >
            Have an idea for FAIRPLAY?
          </div>
          <p
            style={{
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            Share your vision. Every suggestion is read by the team.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('fairplay:openFeedback'))}
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
              boxShadow: '0 4px 24px rgba(0,212,255,0.25)',
            }}
          >
            💡 Share Your Vision
          </button>
        </div>

        {/* bottom spacer */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
