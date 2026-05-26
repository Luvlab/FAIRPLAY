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

const CAMERA_VIEWS = [
  { id: 'broadcast',     label: '📺 Broadcast',       pos: [0,   18,  42] as const, look: [0, 0, 0] as const },
  { id: 'birds_eye',     label: '🚁 Bird\'s Eye',      pos: [0,   90,   1] as const, look: [0, 0, 0] as const },
  { id: 'press_box',     label: '🎙 Press Box',        pos: [0,   50,  50] as const, look: [0, 0, -5] as const },
  { id: 'low_side',      label: '📷 Low Sideline',     pos: [50,   3,   0] as const, look: [0, 1, 0] as const },
  { id: 'behind_north',  label: '⬆ Behind Goal N',    pos: [0,    8, -75] as const, look: [0, 2, 0] as const },
  { id: 'behind_south',  label: '⬇ Behind Goal S',    pos: [0,    8,  75] as const, look: [0, 2, 0] as const },
  { id: 'corner_ne',     label: '↗ Corner NE',         pos: [48,  12, -66] as const, look: [0, 0, 0] as const },
  { id: 'corner_nw',     label: '↖ Corner NW',         pos: [-48, 12, -66] as const, look: [0, 0, 0] as const },
  { id: 'corner_se',     label: '↘ Corner SE',         pos: [48,  12,  66] as const, look: [0, 0, 0] as const },
  { id: 'corner_sw',     label: '↙ Corner SW',         pos: [-48, 12,  66] as const, look: [0, 0, 0] as const },
];

function posToOrbit(x: number, y: number, z: number) {
  const radius = Math.sqrt(x * x + y * y + z * z);
  const phi = Math.asin(Math.max(-1, Math.min(1, y / radius)));
  const theta = Math.atan2(x, z);
  return { radius, phi, theta };
}

export default function StudioPanel() {
  const [view, setView] = useState<'3d' | 'editor'>('3d');
  const [activeCam, setActiveCam] = useState('broadcast');
  const [showCamMenu, setShowCamMenu] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(0);

  // Orbit state as refs so pointer handlers can update without re-render
  const thetaRef = useRef(0);
  const phiRef = useRef(0.42);
  const radiusRef = useRef(42);
  const updateCameraRef = useRef<(() => void) | null>(null);

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
    // NO FOG — full pitch visibility always

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting (flat/strong so nothing dims with distance) ──
    // Bright ambient so the whole pitch is visible
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    // Stadium floodlights from 4 corners (high and bright)
    const floodPositions: [number, number, number][] = [
      [ 40, 35, -55], [-40, 35, -55],
      [ 40, 35,  55], [-40, 35,  55],
    ];
    floodPositions.forEach(([x, y, z]) => {
      const flood = new THREE.DirectionalLight(0xffffff, 0.8);
      flood.position.set(x, y, z);
      flood.castShadow = true;
      flood.shadow.mapSize.set(512, 512);
      // Large shadow frustum to cover whole pitch
      flood.shadow.camera.left = -80;
      flood.shadow.camera.right = 80;
      flood.shadow.camera.top = 80;
      flood.shadow.camera.bottom = -80;
      flood.shadow.camera.far = 200;
      scene.add(flood);
    });

    // ── Pitch ──
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

    // ── Field lines ──
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const drawLine = (points: [number, number, number][]) => {
      const geo = new THREE.BufferGeometry().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
      scene.add(new THREE.Line(geo, lineMat));
    };
    const drawRect = (cx: number, cz: number, w: number, d: number, y = 0.05) => {
      const hw = w / 2, hd = d / 2;
      drawLine([[cx - hw, y, cz - hd], [cx + hw, y, cz - hd], [cx + hw, y, cz + hd], [cx - hw, y, cz + hd], [cx - hw, y, cz - hd]]);
    };

    // Boundary
    drawRect(0, 0, 68, 105);
    // Centre line
    drawLine([[-34, 0.05, 0], [34, 0.05, 0]]);
    // Centre circle
    const circleGeo = new THREE.RingGeometry(9.15, 9.45, 64);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.05;
    scene.add(circle);
    // Centre spot
    const spotGeo = new THREE.CircleGeometry(0.25, 16);
    const spotMesh = new THREE.Mesh(spotGeo, circleMat.clone());
    spotMesh.rotation.x = -Math.PI / 2;
    spotMesh.position.y = 0.06;
    scene.add(spotMesh);

    // Penalty areas
    for (const side of [-1, 1]) {
      const pz = side * 52.5;
      drawRect(0, pz + side * -11, 40.32, 16.5);   // penalty box (inner)
      drawRect(0, pz + side * -5.5, 18.32, 5.5);   // goal box
      // Penalty spot
      const ps = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), circleMat.clone());
      ps.rotation.x = -Math.PI / 2;
      ps.position.set(0, 0.06, pz + side * -11);
      scene.add(ps);
    }

    // ── Goals — highly visible with nets ──
    const goalPostMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.6 });
    const postR = 0.1;
    const goalW = 7.32;
    const goalH = 2.44;
    const goalD = 2.0;

    for (const side of [-1, 1]) {
      const gz = side * 52.5;
      const dir = -side; // net goes inward

      // Posts
      for (const x of [-goalW / 2, goalW / 2]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, goalH, 12), goalPostMat);
        post.position.set(x, goalH / 2, gz);
        post.castShadow = true;
        scene.add(post);
      }
      // Crossbar
      const cross = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, goalW, 12), goalPostMat);
      cross.rotation.z = Math.PI / 2;
      cross.position.set(0, goalH, gz);
      scene.add(cross);

      // Back post (net frame)
      for (const x of [-goalW / 2, goalW / 2]) {
        const backPost = new THREE.Mesh(new THREE.CylinderGeometry(postR * 0.7, postR * 0.7, goalH, 8), goalPostMat);
        backPost.position.set(x, goalH / 2, gz + dir * goalD);
        scene.add(backPost);
      }
      // Top back bar
      const topBack = new THREE.Mesh(new THREE.CylinderGeometry(postR * 0.7, postR * 0.7, goalW, 8), goalPostMat);
      topBack.rotation.z = Math.PI / 2;
      topBack.position.set(0, goalH, gz + dir * goalD);
      scene.add(topBack);

      // Net (translucent mesh panel)
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      // Back net
      const backNet = new THREE.Mesh(new THREE.PlaneGeometry(goalW, goalH, 14, 8), netMat);
      backNet.position.set(0, goalH / 2, gz + dir * goalD);
      scene.add(backNet);
      // Side nets
      for (const sx of [-1, 1]) {
        const sideNet = new THREE.Mesh(new THREE.PlaneGeometry(goalD, goalH, 4, 8), netMat.clone());
        sideNet.rotation.y = Math.PI / 2;
        sideNet.position.set(sx * goalW / 2, goalH / 2, gz + dir * goalD / 2);
        scene.add(sideNet);
      }
      // Top net
      const topNet = new THREE.Mesh(new THREE.PlaneGeometry(goalW, goalD, 14, 4), netMat.clone());
      topNet.rotation.x = Math.PI / 2;
      topNet.position.set(0, goalH, gz + dir * goalD / 2);
      scene.add(topNet);

      // Glow ring around goal mouth so it pops
      const glowGeo = new THREE.RingGeometry(0.01, 0.3, 24);
      const glowMat = new THREE.MeshBasicMaterial({ color: side === -1 ? 0xee3333 : 0x3388ee, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      for (const x of [-goalW / 2, goalW / 2]) {
        const dot = new THREE.Mesh(glowGeo, glowMat);
        dot.position.set(x, 0.05, gz);
        dot.rotation.x = -Math.PI / 2;
        scene.add(dot);
      }
    }

    // ── Players ──
    const playerPositions: [number, number, number, number][] = [
      [0, 0, -20, 0xee3333], [-15, 0, -30, 0xee3333], [15, 0, -30, 0xee3333],
      [-10, 0, -15, 0xee3333], [10, 0, -15, 0xee3333],
      [0, 0, 5, 0x3388ee], [-12, 0, 20, 0x3388ee], [12, 0, 20, 0x3388ee],
      [-8, 0, 30, 0x3388ee], [8, 0, 30, 0x3388ee], [0, 0, 40, 0x3388ee],
    ];
    playerPositions.forEach(([x, _y, z, color]) => {
      // Body
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.4, 0.8, 4, 8),
        new THREE.MeshLambertMaterial({ color })
      );
      body.position.set(x, 1.0, z);
      body.castShadow = true;
      scene.add(body);
      // Head
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xf5cba7 })
      );
      head.position.set(x, 2.1, z);
      scene.add(head);
    });

    // ── Ball ──
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 })
    );
    ball.position.set(2, 0.35, -5);
    ball.castShadow = true;
    scene.add(ball);
    // Ball point light so it glows slightly
    const ballLight = new THREE.PointLight(0xffffff, 0.4, 5);
    ball.add(ballLight);

    // ── Orbit controls ──
    const [p0x, p0y, p0z] = CAMERA_VIEWS[0].pos;
    const orbit = posToOrbit(p0x, p0y, p0z);
    thetaRef.current = orbit.theta;
    phiRef.current = orbit.phi;
    radiusRef.current = orbit.radius;

    const updateCamera = () => {
      const r = radiusRef.current;
      const p = phiRef.current;
      const t = thetaRef.current;
      const camView = CAMERA_VIEWS.find(v => v.id === 'broadcast')!;
      camera.position.set(
        r * Math.sin(t) * Math.cos(p),
        r * Math.sin(p),
        r * Math.cos(t) * Math.cos(p)
      );
      camera.lookAt(camView.look[0], camView.look[1], camView.look[2]);
    };
    updateCameraRef.current = updateCamera;
    updateCamera();

    let isDown = false, lastX = 0, lastY = 0;
    const onDown = (e: PointerEvent) => { isDown = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { isDown = false; };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      thetaRef.current -= (e.clientX - lastX) * 0.005;
      phiRef.current = Math.max(0.05, Math.min(Math.PI / 2 - 0.01, phiRef.current - (e.clientY - lastY) * 0.005));
      lastX = e.clientX; lastY = e.clientY;
      updateCamera();
    };
    const onWheel = (e: WheelEvent) => {
      radiusRef.current = Math.max(5, Math.min(120, radiusRef.current + e.deltaY * 0.05));
      updateCamera();
    };

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    // Resize observer
    const resizeObs = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    if (mountRef.current) resizeObs.observe(mountRef.current);

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (ball) ball.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [view]);

  const setCameraView = (camId: string) => {
    const v = CAMERA_VIEWS.find(c => c.id === camId);
    if (!v || !cameraRef.current) return;
    setActiveCam(camId);
    setShowCamMenu(false);
    const [px, py, pz] = v.pos;
    const [lx, ly, lz] = v.look;
    cameraRef.current.position.set(px, py, pz);
    cameraRef.current.lookAt(lx, ly, lz);
    const orbit = posToOrbit(px, py, pz);
    thetaRef.current = orbit.theta;
    phiRef.current = orbit.phi;
    radiusRef.current = orbit.radius;
  };

  // Editor canvas drawing
  useEffect(() => {
    if (view !== 'editor' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);
    annotations.forEach((a) => {
      ctx.save();
      ctx.strokeStyle = a.color;
      ctx.fillStyle = a.color;
      ctx.lineWidth = 2;
      ctx.font = `bold ${a.size * 12}px system-ui`;
      if (a.type === 'text' && a.text) {
        ctx.fillText(a.text, a.x, a.y);
      } else if (a.type === 'circle') {
        ctx.beginPath(); ctx.arc(a.x, a.y, a.size * 20, 0, Math.PI * 2); ctx.stroke();
      } else if (a.type === 'rect') {
        ctx.strokeRect(a.x - a.size * 15, a.y - a.size * 10, a.size * 30, a.size * 20);
      } else if (a.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(a.x - a.size * 20, a.y); ctx.lineTo(a.x + a.size * 20, a.y);
        ctx.moveTo(a.x + a.size * 10, a.y - a.size * 8); ctx.lineTo(a.x + a.size * 20, a.y); ctx.lineTo(a.x + a.size * 10, a.y + a.size * 8);
        ctx.stroke();
      }
      ctx.restore();
    });
  }, [annotations, view]);

  const TOOLS: Array<{ id: EditorTool; label: string; emoji: string }> = [
    { id: 'select', label: 'Select', emoji: '↖️' },
    { id: 'text',   label: 'Text',   emoji: 'T' },
    { id: 'arrow',  label: 'Arrow',  emoji: '→' },
    { id: 'circle', label: 'Circle', emoji: '○' },
    { id: 'rect',   label: 'Rect',   emoji: '□' },
    { id: 'line',   label: 'Line',   emoji: '/' },
    { id: 'image',  label: 'Import', emoji: '🖼' },
    { id: 'zoom',   label: 'Zoom',   emoji: '🔍' },
  ];

  const COLORS = ['#00d4ff', '#ff4444', '#FFD700', '#00ff88', '#ff8800', '#aa88ff', '#ffffff', '#ff69b4'];

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (activeTool === 'text') { setTextPos({ x, y }); setShowTextInput(true); return; }
    setAnnotations((prev) => [...prev, { id: `a-${Date.now()}`, type: activeTool, x, y, color: activeColor, size: 1 }]);
  };

  const addText = () => {
    if (!textInput.trim()) { setShowTextInput(false); return; }
    setAnnotations((prev) => [...prev, { id: `a-${Date.now()}`, type: 'text', x: textPos.x, y: textPos.y, text: textInput, color: activeColor, size: 1.5 }]);
    setTextInput(''); setShowTextInput(false);
  };

  const activeCamLabel = CAMERA_VIEWS.find(v => v.id === activeCam)?.label ?? '📺 Broadcast';

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <button className={`nav-tab ${view === '3d' ? 'active' : ''}`} onClick={() => setView('3d')}>🔮 3D VIEW</button>
        <button className={`nav-tab ${view === 'editor' ? 'active' : ''}`} onClick={() => setView('editor')}>🎬 EDITOR</button>
      </div>

      {view === '3d' && (
        <div className="flex-1 relative overflow-hidden">
          <div ref={mountRef} className="w-full h-full" />

          {/* HUD */}
          <div className="absolute top-3 left-3 space-y-1.5 pointer-events-none">
            <div className="glass rounded-lg px-3 py-1.5 text-xs font-bold" style={{ color: '#00d4ff' }}>
              🔮 PHOTOGRAMMETRY 3D
            </div>
            <div className="glass rounded-lg px-2 py-1 text-xs text-white/40">
              Drag to orbit · Scroll to zoom
            </div>
          </div>

          {/* Camera view selector */}
          <div className="absolute top-3 right-3">
            <button
              className="call-btn glass rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2"
              style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}
              onClick={() => setShowCamMenu(!showCamMenu)}
            >
              {activeCamLabel}
              <span className="text-white/40">{showCamMenu ? '▲' : '▼'}</span>
            </button>

            {showCamMenu && (
              <div
                className="absolute right-0 mt-1 rounded-xl overflow-hidden"
                style={{ background: '#0d1117', border: '1px solid rgba(0,212,255,0.2)', minWidth: 200, zIndex: 10 }}
              >
                {CAMERA_VIEWS.map((v) => (
                  <button
                    key={v.id}
                    className="w-full text-left px-3 py-2 text-xs font-bold call-btn flex items-center gap-2"
                    style={activeCam === v.id
                      ? { background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }
                      : { color: 'rgba(255,255,255,0.6)' }
                    }
                    onClick={() => setCameraView(v.id)}
                  >
                    {v.label}
                    {activeCam === v.id && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Team legend */}
          <div className="absolute bottom-16 right-3 glass rounded-xl p-2 text-xs space-y-1 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#ee3333' }} />
              <span className="text-white/60">Home</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: '#3388ee' }} />
              <span className="text-white/60">Away</span>
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
          <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                className={`editor-tool flex-shrink-0 ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <span style={{ fontWeight: 'bold', color: activeTool === tool.id ? '#00d4ff' : 'rgba(255,255,255,0.7)' }}>
                  {tool.emoji}
                </span>
              </button>
            ))}
            <div className="w-px h-8 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
            {COLORS.map((c) => (
              <button
                key={c}
                className="rounded-full flex-shrink-0 call-btn"
                style={{
                  width: 'clamp(20px, 2.5vw, 28px)',
                  height: 'clamp(20px, 2.5vw, 28px)',
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

          {/* Video timeline */}
          <div className="flex items-center gap-3 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏮</button>
            <button className="call-btn text-white/60 text-xs px-2 py-1 rounded glass">⏪</button>
            <button className="call-btn px-3 py-1 rounded-lg text-sm glass" style={{ color: '#00d4ff' }}>▶</button>
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
            {showTextInput && (
              <div className="absolute glass rounded-xl p-3 shadow-2xl z-10" style={{ left: Math.min(textPos.x, 200), top: Math.min(textPos.y - 60, 300) }}>
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
            {annotations.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-white/10 text-6xl mb-2">🎬</div>
                <div className="text-white/20 text-sm">Click to add annotations</div>
              </div>
            )}
          </div>

          {/* Export bar */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <button className="call-btn px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88' }}>📤 EXPORT VIDEO</button>
            <button className="call-btn px-4 py-2 rounded-xl text-xs font-bold" style={{ background: 'rgba(170,136,255,0.15)', border: '1px solid rgba(170,136,255,0.3)', color: '#aa88ff' }}>📸 EXPORT FRAME</button>
            <button className="call-btn px-4 py-2 rounded-xl text-xs font-bold ml-auto" style={{ background: 'rgba(255,120,0,0.15)', border: '1px solid rgba(255,120,0,0.3)', color: '#ff8800' }}>🔮 SEND TO 3D</button>
          </div>
        </div>
      )}
    </div>
  );
}
