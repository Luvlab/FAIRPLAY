import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore, isGameLive } from '../store/gameStore';

export default function CameraCapture() {
  const currentGame      = useGameStore((s) => s.currentGame);
  const uploadAndAddMedia = useGameStore((s) => s.uploadAndAddMedia);

  const gameLive = isGameLive(currentGame?.status);

  const [open, setOpen]                     = useState(false);
  const [recording, setRecording]           = useState(false);
  const [elapsed, setElapsed]               = useState(0);
  const [facingMode, setFacingMode]         = useState<'environment' | 'user'>('environment');
  const [recordedBlob, setRecordedBlob]     = useState<Blob | null>(null);
  const [permError, setPermError]           = useState<string | null>(null);
  const [uploading, setUploading]           = useState(false);
  const [uploadDone, setUploadDone]         = useState(false);

  const videoRef      = useRef<HTMLVideoElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const recorderRef   = useRef<MediaRecorder | null>(null);
  const chunksRef     = useRef<Blob[]>([]);
  const timerRef      = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startStream = useCallback(async (facing: 'environment' | 'user') => {
    stopStream();
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setPermError('Camera access denied — check your browser settings');
    }
  }, [stopStream]);

  // Start stream when sheet opens
  useEffect(() => {
    if (open) {
      setRecordedBlob(null);
      setElapsed(0);
      setUploadDone(false);
      void startStream(facingMode);
    } else {
      stopStream();
      if (recording) {
        recorderRef.current?.stop();
        setRecording(false);
      }
      clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Re-start stream when facingMode changes (only if open and not recording)
  useEffect(() => {
    if (open && !recording) {
      void startStream(facingMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Attach stream to video element after open (in case ref wasn't ready)
  useEffect(() => {
    if (open && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      clearInterval(timerRef.current);
    };
    recorder.start(250);
    recorderRef.current = recorder;
    setRecording(true);
    setElapsed(0);
    setRecordedBlob(null);

    timerRef.current = setInterval(() => {
      setElapsed((s) => {
        if (s >= 119) {
          stopRecording();
          return 120;
        }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setRecording(false);
  };

  const saveToDevice = () => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairplay-clip-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadToMatch = async () => {
    if (!recordedBlob || !currentGame) return;
    setUploading(true);
    try {
      const file = new File([recordedBlob], `fairplay-clip-${Date.now()}.webm`, { type: 'video/webm' });
      await uploadAndAddMedia(file, 0, 'Camera clip', null);
      setUploadDone(true);
    } catch {
      // silently fail — user can still save to device
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (recording) stopRecording();
    stopStream();
    setOpen(false);
    setRecordedBlob(null);
    setElapsed(0);
    setPermError(null);
    setUploadDone(false);
  };

  const flipCamera = () => {
    setFacingMode((f) => (f === 'environment' ? 'user' : 'environment'));
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!gameLive) return null;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 140,
          right: 16,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(0,212,255,0.1))',
          border: '1px solid rgba(0,212,255,0.4)',
          color: '#00d4ff',
          fontSize: 22,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,212,255,0.2)',
          zIndex: 40,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        title="Record a clip"
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        📹
      </button>

      {/* Bottom sheet overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.72)',
              zIndex: 50,
            }}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 51,
              background: 'linear-gradient(180deg, #111827, #0d1117)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
              borderRadius: '24px 24px 0 0',
              padding: 'clamp(16px, 3vw, 28px)',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -8 }}>
              <div style={{ width: 40, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 900, fontSize: 'clamp(15px, 2.2vw, 18px)', color: '#fff' }}>
                📹 Record Clip
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {permError ? (
              <div
                style={{
                  padding: '20px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,68,68,0.08)',
                  border: '1px solid rgba(255,68,68,0.2)',
                  color: '#ff6666',
                  fontSize: 'clamp(12px, 1.6vw, 14px)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                🚫 {permError}
              </div>
            ) : (
              <>
                {/* Live preview */}
                <div
                  style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio: '16/9',
                    width: '100%',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Recording timer overlay */}
                  {recording && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(0,0,0,0.6)',
                        borderRadius: 99,
                        padding: '4px 10px',
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#ff4444',
                          animation: 'pulse 1s infinite',
                        }}
                      />
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(elapsed)} / 2:00
                      </span>
                    </div>
                  )}

                  {/* Flip camera button */}
                  {!recordedBlob && (
                    <button
                      onClick={flipCamera}
                      disabled={recording}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 12,
                        background: 'rgba(0,0,0,0.55)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        color: recording ? 'rgba(255,255,255,0.3)' : '#fff',
                        fontSize: 18,
                        cursor: recording ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Flip camera"
                    >
                      🔄
                    </button>
                  )}
                </div>

                {/* Controls */}
                {!recordedBlob ? (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: recording
                          ? 'rgba(255,68,68,0.2)'
                          : 'rgba(255,68,68,0.85)',
                        border: recording
                          ? '3px solid #ff4444'
                          : '4px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: recording ? '0 0 24px rgba(255,68,68,0.5)' : 'none',
                      }}
                      title={recording ? 'Stop recording' : 'Start recording'}
                    >
                      {recording ? (
                        <div style={{ width: 22, height: 22, background: '#ff4444', borderRadius: 4 }} />
                      ) : (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff' }} />
                      )}
                    </button>
                  </div>
                ) : (
                  /* Post-recording actions */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
                    <div style={{ fontSize: 'clamp(11px, 1.4vw, 13px)', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                      Clip recorded ({formatTime(elapsed)}) — choose what to do:
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={saveToDevice}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          borderRadius: 12,
                          background: 'rgba(0,212,255,0.1)',
                          border: '1px solid rgba(0,212,255,0.3)',
                          color: '#00d4ff',
                          fontWeight: 700,
                          fontSize: 'clamp(12px, 1.6vw, 14px)',
                          cursor: 'pointer',
                        }}
                      >
                        💾 Save to Device
                      </button>
                      <button
                        onClick={uploadToMatch}
                        disabled={uploading || uploadDone}
                        style={{
                          flex: 1,
                          padding: '12px 0',
                          borderRadius: 12,
                          background: uploadDone
                            ? 'rgba(0,255,136,0.1)'
                            : uploading
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,255,136,0.12)',
                          border: `1px solid ${uploadDone ? 'rgba(0,255,136,0.4)' : uploading ? 'rgba(255,255,255,0.1)' : 'rgba(0,255,136,0.3)'}`,
                          color: uploadDone ? '#00ff88' : uploading ? 'rgba(255,255,255,0.3)' : '#00ff88',
                          fontWeight: 700,
                          fontSize: 'clamp(12px, 1.6vw, 14px)',
                          cursor: uploading || uploadDone ? 'default' : 'pointer',
                        }}
                      >
                        {uploadDone ? '✅ Uploaded' : uploading ? '⏳ Uploading…' : '☁️ Upload to Match'}
                      </button>
                    </div>
                    <button
                      onClick={() => { setRecordedBlob(null); setElapsed(0); setUploadDone(false); }}
                      style={{
                        padding: '10px 0',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.4)',
                        fontWeight: 600,
                        fontSize: 'clamp(11px, 1.4vw, 13px)',
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Record Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
