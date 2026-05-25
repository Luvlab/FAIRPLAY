import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type EditorTool = 'select' | 'text' | 'arrow' | 'circle' | 'rect' | 'line' | 'image' | 'zoom';

interface Annotation {
  id: string;
  type: EditorTool;
  x: number;
  y: number;
  text?: string;
  color: string;
  size: number;
}

export default function StudioPanel() {
  const [view, setView] = useState<'3d' | 'editor'>('3d');
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const _sceneRef = useRef<THREE.Scene | null>(null);
  const _cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);

  // Editor state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeColor, setActiveColor] = useState('#00d4ff');
  const [_drawing, _setDrawing] = useState(false);
  const [_startPos, _setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });

  // 3D Scene setup
  useEffect(() => {
    if (view !== '3d' || !mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05080f);
    scene.fog = new THREE.Fog(0x05080f, 30, 80);
    _sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 12, 22);
    camera.lookAt(0, 0, 0);
    _cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0x404060, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);
    const fillLight = new THREE.PointLight(0x0088ff, 0.8, 50);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Pitch
    const pitchGeo = new THREE.PlaneGeometry(68, 105);
    const pitchMat = new THREE.MeshLambertMaterial({ color: 0x1a5c1a });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Alternating stripes
    for (let i = 0; i < 7; i++) {
      const stripeGeo = new THREE.PlaneGeometry(68, 15);
      const stripeMat = new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x1e6b1e : 0x176017 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, -52.5 + i * 15);
      scene.add(stripe);
    }

    // Field lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    const drawLine = (points: [number, number, number][]) => {
      const geo = new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
      scene.add(new THREE.Line(geo, lineMat));
    };

    // Boundary
    drawLine([[-34, 0.02, -52.5], [34, 0.02, -52.5], [34, 0.02, 52.5], [-34, 0.02, 52.5], [-34, 0.02, -52.5]]);
    // Centre line
    drawLine([[-34, 0.02, 0], [34, 0.02, 0]]);
    // Centre circle
    const circleGeo = new THREE.RingGeometry(9.15, 9.35, 64);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.02;
    scene.add(circle);

    // Goals
    const goalMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const goalPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.44);
    const goalTopGeo = new THREE.CylinderGeometry(0.06, 0.06, 7.32);

    for (const side of [-1, 1]) {
      const post1 = new THREE.Mesh(goalPostGeo, goalMat);
      post1.position.set(-3.66, 1.22, side * 52.5);
      scene.add(post1);
      const post2 = new THREE.Mesh(goalPostGeo, goalMat);
      post2.position.set(3.66, 1.22, side * 52.5);
      scene.add(post2);
      const crossbar = new THREE.Mesh(goalTopGeo, goalMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 2.44, side * 52.5);
      scene.add(crossbar);
    }

    // Sample player spheres
    const playerPositions: [number, number, number, number][] = [
      [0, 0, -20, 0xee3333], [-15, 0, -30, 0xee3333], [15, 0, -30, 0xee3333],
      [-10, 0, -15, 0xee3333], [10, 0, -15, 0xee3333],
      [0, 0, 5, 0x3388ee], [-12, 0, 20, 0x3388ee], [12, 0, 20, 0x3388ee],
      [-8, 0, 30, 0x3388ee], [8, 0, 30, 0x3388ee],
      [0, 0, 40, 0x3388ee],
    ];
    playerPositions.forEach(([x, _y, z, color]) => {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshLambertMaterial({ color })
      );
      sphere.position.set(x, 0.5, z);
      sphere.castShadow = true;
      scene.add(sphere);
    });

    // Ball
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    ball.position.set(2, 0.35, -5);
    ball.castShadow = true;
    scene.add(ball);

    // Grid helper
    const gridHelper = new THREE.GridHelper(68, 20, 0x333333, 0x222222);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Orbit controls via mouse/touch
    let isPointerDown = false;
    let lastX = 0, lastY = 0;
    let theta = 0, phi = 0.4, radius = 28;

    const updateCamera = () => {
      camera.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onPointerDown = (e: PointerEvent) => { isPointerDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onPointerUp = () => { isPointerDown = false; };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = (e.clientX - lastX) * 0.005;
      const dy = (e.clientY - lastY) * 0.005;
      theta -= dx;
      phi = Math.max(0.1, Math.min(Math.PI / 2, phi - dy));
      lastX = e.clientX; lastY = e.clientY;
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      radius = Math.max(5, Math.min(60, radius + e.deltaY * 0.05));
      updateCamera();
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      // Slow ball rotation
      if (ball) ball.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [view]);

  // Editor canvas drawing
  useEffect(() => {
    if (view !== 'editor' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    ctx.clearRect(0, 0, w, h);
    // Black background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Draw annotations
    annotations.forEach((a) => {
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.fillStyle = a.color;
      ctx.lineWidth = 2;
      ctx.font = `bold ${a.size * 12}px system-ui`;
      if (a.type === 'text' && a.text) {
        ctx.fillText(a.text, a.x, a.y);
      } else if (a.type === 'circle') {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size * 20, 0, Math.PI * 2);
        ctx.stroke();
      } else if (a.type === 'rect') {
        ctx.strokeRect(a.x - a.size * 15, a.y - a.size * 10, a.size * 30, a.size * 20);
      } else if (a.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(a.x - a.size * 20, a.y);
        ctx.lineTo(a.x + a.size * 20, a.y);
        ctx.moveTo(a.x + a.size * 10, a.y - a.size * 8);
        ctx.lineTo(a.x + a.size * 20, a.y);
        ctx.lineTo(a.x + a.size * 10, a.y + a.size * 8);
        ctx.stroke();
      }
      ctx.restore();
    });
  }, [annotations, view]);

  const TOOLS: Array<{ id: EditorTool; label: string; emoji: string }> = [
    { id: 'select', label: 'Select', emoji: '↖️' },
    { id: 'text', label: 'Text', emoji: 'T' },
    { id: 'arrow', label: 'Arrow', emoji: '→' },
    { id: 'circle', label: 'Circle', emoji: '○' },
    { id: 'rect', label: 'Rectangle', emoji: '□' },
    { id: 'line', label: 'Line', emoji: '/' },
    { id: 'image', label: 'Import', emoji: '🖼' },
    { id: 'zoom', label: 'Zoom', emoji: '🔍' },
  ];

  const COLORS = ['#00d4ff', '#ff4444', '#FFD700', '#00ff88', '#ff8800', '#aa88ff', '#ffffff', '#ff69b4'];

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'text') {
      setTextPos({ x, y });
      setShowTextInput(true);
      return;
    }

    const newAnnotation: Annotation = {
      id: `a-${Date.now()}`,
      type: activeTool,
      x, y,
      color: activeColor,
      size: 1,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const addText = () => {
    if (!textInput.trim()) { setShowTextInput(false); return; }
    setAnnotations((prev) => [...prev, {
      id: `a-${Date.now()}`,
      type: 'text',
      x: textPos.x,
      y: textPos.y,
      text: textInput,
      color: activeColor,
      size: 1.5,
    }]);
    setTextInput('');
    setShowTextInput(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        <button
          className={`nav-tab ${view === '3d' ? 'active' : ''}`}
          onClick={() => setView('3d')}
        >
          🔮 3D VIEW
        </button>
        <button
          className={`nav-tab ${view === 'editor' ? 'active' : ''}`}
          onClick={() => setView('editor')}
        >
          🎬 EDITOR
        </button>
      </div>

      {view === '3d' && (
        <div className="flex-1 relative overflow-hidden">
          <div ref={mountRef} className="w-full h-full" />
          {/* HUD */}
          <div className="absolute top-3 left-3 space-y-1 pointer-events-none">
            <div className="glass rounded-lg px-3 py-1.5 text-xs font-bold" style={{ color: '#00d4ff' }}>
              🔮 PHOTOGRAMMETRY 3D
            </div>
            <div className="glass rounded-lg px-2 py-1 text-xs text-white/50">
              Drag to orbit • Scroll to zoom
            </div>
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            {[
              { label: '⬆', action: 'up' },
              { label: '⬇', action: 'down' },
            ].map(({ label }) => (
              <button
                key={label}
                className="call-btn w-9 h-9 rounded-lg glass text-sm font-bold flex items-center justify-center"
                style={{ color: '#00d4ff' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Player labels */}
          <div className="absolute top-3 right-3 glass rounded-xl p-2 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ee3333' }} />
              <span className="text-white/60">Arsenal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#3388ee' }} />
              <span className="text-white/60">Chelsea</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ffffff' }} />
              <span className="text-white/60">Ball</span>
            </div>
          </div>

          {/* Auto-edit button */}
          <div className="absolute bottom-3 left-3">
            <button
              className="call-btn px-4 py-2 rounded-xl text-xs font-bold glass"
              style={{ border: '1px solid rgba(255,120,0,0.4)', color: '#ff8800' }}
            >
              ✨ AUTO-EDIT CLIP
            </button>
          </div>
        </div>
      )}

      {view === 'editor' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tool palette */}
          <div
            className="flex items-center gap-1 px-2 py-2 overflow-x-auto"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
          >
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                className={`editor-tool flex-shrink-0 ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <span style={{ fontSize: tool.emoji.length > 1 ? 16 : 14, fontWeight: 'bold', color: activeTool === tool.id ? '#00d4ff' : 'rgba(255,255,255,0.7)' }}>
                  {tool.emoji}
                </span>
              </button>
            ))}

            <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

            {/* Color palette */}
            {COLORS.map((c) => (
              <button
                key={c}
                className="w-6 h-6 rounded-full flex-shrink-0 call-btn"
                style={{
                  background: c,
                  border: activeColor === c ? '2px solid white' : '2px solid transparent',
                  boxShadow: activeColor === c ? `0 0 8px ${c}` : 'none',
                }}
                onClick={() => setActiveColor(c)}
              />
            ))}

            <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <button
              className="call-btn px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444' }}
              onClick={() => setAnnotations([])}
            >
              CLEAR
            </button>
          </div>

          {/* Video timeline bar */}
          <div
            className="flex items-center gap-3 px-3 py-2"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
          >
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏮</button>
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏪</button>
            <button className="call-btn text-white px-3 py-1 rounded-lg text-sm glass" style={{ color: '#00d4ff' }}>▶</button>
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏩</button>
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏭</button>
            <div className="flex-1 h-2 rounded-full cursor-pointer" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full w-1/3 rounded-full" style={{ background: 'linear-gradient(90deg, #00d4ff, #0088ff)' }} />
            </div>
            <span className="text-xs text-white/40 font-mono">0:23 / 1:12</span>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden" style={{ background: '#0d1117' }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full"
              style={{ cursor: activeTool === 'text' ? 'text' : activeTool === 'zoom' ? 'zoom-in' : 'crosshair' }}
              onClick={handleCanvasClick}
            />

            {/* Text input popup */}
            {showTextInput && (
              <div
                className="absolute glass rounded-xl p-3 shadow-2xl z-10"
                style={{ left: Math.min(textPos.x, 200), top: Math.min(textPos.y - 60, 300) }}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter text..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addText()}
                  className="rounded px-2 py-1 text-sm mb-2 w-full"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
                />
                <div className="flex gap-1">
                  <button className="call-btn flex-1 py-1 rounded text-xs font-bold" style={{ background: 'rgba(0,212,255,0.2)', color: '#00d4ff' }} onClick={addText}>ADD</button>
                  <button className="call-btn flex-1 py-1 rounded text-xs" style={{ color: 'rgba(255,255,255,0.5)' }} onClick={() => setShowTextInput(false)}>✕</button>
                </div>
              </div>
            )}

            {/* Placeholder overlay when empty */}
            {annotations.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-white/10 text-6xl mb-2">🎬</div>
                <div className="text-white/20 text-sm">Click to add annotations</div>
                <div className="text-white/10 text-xs mt-1">Import video or image from Timeline</div>
              </div>
            )}
          </div>

          {/* Export bar */}
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
          >
            <button
              className="call-btn px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}
            >
              📤 EXPORT VIDEO
            </button>
            <button
              className="call-btn px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(170,136,255,0.15)', border: '1px solid rgba(170,136,255,0.3)', color: '#aa88ff' }}
            >
              📸 EXPORT FRAME
            </button>
            <button
              className="call-btn px-4 py-2 rounded-xl text-xs font-bold ml-auto"
              style={{ background: 'rgba(255,120,0,0.15)', border: '1px solid rgba(255,120,0,0.3)', color: '#ff8800' }}
            >
              🔮 SEND TO 3D
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
