import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, staticFile, Img, Video, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';
import {SubtitleSequence, TypewriterCaption} from 'remotion-subtitle';

type Props = {
  // folder relative to public/static/bg-image/环保清单
  images?: string[];
  bgMusic?: string;
  bgVideo?: string;
  speech?: string;
  gapSec?: number;
  config?: {
    images?: string[];
    bgMusic?: string;
    bgVideo?: string;
    speech?: string;
    perImageSec?: number;
    gapSec?: number;
    particleCount?: number;
  };
};

const ImagePanel: React.FC<{src: string; startFrame: number; duration: number; zIndex?: number}> = ({src, startFrame, duration, zIndex = 1}) => {
  if (!src) return null;
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  // Timings: entrance (0 -> 12 frames), hold (12 -> duration-12), exit (duration-12 -> duration)
  const enterDur = Math.min(12, Math.floor(duration / 4));
  const exitDur = enterDur;

  const opacity = interpolate(local, [0, enterDur, duration - exitDur, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // translateY from 40px -> 0 on enter, 0 -> -40px on exit
  const translateY = interpolate(local, [0, enterDur, duration - exitDur, duration], [40, 0, 0, -40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // rotation: enter from -10deg -> 0, exit to 10deg
  const rotate = interpolate(local, [0, enterDur, duration - exitDur, duration], [-10, 0, 0, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3D flip (rotateY) for cooler effect: flip in during entrance, flip out during exit
  const rotateY = interpolate(local, [0, enterDur, duration - exitDur, duration], [25, 0, 0, -25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // slight zoom-in from 0.98 -> 1 during hold (never exceed 1)
  const scale = 1 + interpolate(local, [0, duration], [-0.02, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0, top: 0, zIndex, perspective: 1200}}>
      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transformStyle: 'preserve-3d'}}>
          <Img
            src={staticFile(src)}
            style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `translateY(${translateY}px) rotate(${rotate}deg) rotateY(${rotateY}deg) scale(${scale})`,
            opacity,
            transition: 'none',
            backfaceVisibility: 'hidden',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const ParticleLayer: React.FC<{frame: number; count?: number; zIndex?: number}> = ({frame, count = 30, zIndex = 10}) => {
  const particles = new Array(count).fill(0).map((_, idx) => {
    const speed = 0.2 + (idx % 5) * 0.05;
    const x = (Math.sin((frame + idx * 13) * 0.02 * speed) * 0.5 + 0.5) * 100; // percent
    const y = ((frame * 0.3 + idx * 37) % 100); // percent
    const size = 2 + (idx % 5);
    const opacity = 0.15 + (idx % 10) * 0.02;
    return {x, y, size, opacity, key: `p-${idx}`};
  });

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex}}>
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            opacity: p.opacity,
            filter: 'blur(1px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
};

export const EnvScrollTemplate: React.FC<Props> = ({
  images,
  bgMusic,
  bgVideo,
  speech,
  gapSec = 3,
  config,
}) => {
  // normalize values: prefer those in `config` if present, otherwise fall back to top-level props or defaults
  const effective = {
    images: config?.images ?? images ?? ['static/bg-image/环保清单/1.jpg','static/bg-image/环保清单/2.png','static/bg-image/环保清单/3.png','static/bg-image/环保清单/4.jpg','static/bg-image/环保清单/5.jpg'],
    bgMusic: config?.bgMusic ?? bgMusic ?? 'static/bg-music/bg1.mp3',
    bgVideo: config?.bgVideo ?? bgVideo ?? 'static/bg-video/环保清单/huoche.mp4',
    speech: config?.speech ?? speech ?? 'static/audio/speech.mp3',
    perImageSec: config?.perImageSec ?? 5,
    gapSec: config?.gapSec ?? gapSec,
    particleCount: config?.particleCount ?? 40,
    subtitles: config?.subtitles ?? undefined,
    srt: config?.srt ?? undefined,
  };

  const perImageSec = effective.perImageSec; // seconds per image
  const perImageFrames = perImageSec * 30;
  const gapFrames = Math.max(0, Math.floor(effective.gapSec * 30));
  const slotFrames = perImageFrames + gapFrames;
  const frame = useCurrentFrame();
  const currentIndex = Math.floor(frame / slotFrames);

  // subtitles may come from effective.subtitles or from an external SRT file (effective.srt)
  const [srtSubtitles, setSrtSubtitles] = useState<any[] | undefined>(effective.subtitles);
  const [subtitleSequences, setSubtitleSequences] = useState<React.ReactNode | null>(null);
  const {fps} = useVideoConfig();

  useEffect(() => {
    let cancelled = false;
    const parseSrt = (text: string) => {
      const blocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
      const cues: any[] = [];
      for (const block of blocks) {
        const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          const timeLine = lines[1] || lines[0];
          const m = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
          if (m) {
            const toSecs = (t: string) => {
              const [hh, mm, rest] = t.split(':');
              const [ss, ms] = rest.split(',');
              return Number(hh) * 3600 + Number(mm) * 60 + Number(ss) + Number(ms) / 1000;
            };
            const start = toSecs(m[1]);
            const end = toSecs(m[2]);
            const textLines = lines.slice(2).length ? lines.slice(2) : [lines.slice(0,1).join(' ')];
            cues.push({text: textLines.join('\n'), startSec: start, durationSec: Math.max(0.1, end - start)});
          }
        }
      }
      return cues;
    };

    if ((!effective.subtitles || effective.subtitles.length === 0) && effective.srt && typeof window !== 'undefined') {
      // prefer using remotion-subtitle library when available
      try {
        const seq = new SubtitleSequence(effective.srt.replace(/^static\//, ''));
        seq.ready().then(() => {
          const sequences = seq.getSequences(<TypewriterCaption style={{fontSize: '48px'}} />, fps || 30);
          if (!cancelled) setSubtitleSequences(sequences as any);
        }).catch((e) => {
          console.warn('remotion-subtitle ready failed', e);
          // fallback: fetch and parse manually
          const srtUrl = `/static/${effective.srt.replace(/^static\//, '')}`;
          fetch(srtUrl, {cache: 'no-store'})
            .then((r) => r.ok ? r.text() : Promise.reject(new Error('Failed to load srt')))
            .then((text) => {
              if (cancelled) return;
              const cues = parseSrt(text);
              setSrtSubtitles(cues);
            })
            .catch((e2) => {
              console.warn('Failed to fetch/parse srt in EnvScrollTemplate', e2);
            });
        });
      } catch (err) {
        // failed to instantiate remotion-subtitle, fallback
        const srtUrl = `/static/${effective.srt.replace(/^static\//, '')}`;
        fetch(srtUrl, {cache: 'no-store'})
          .then((r) => r.ok ? r.text() : Promise.reject(new Error('Failed to load srt')))
          .then((text) => {
            if (cancelled) return;
            const cues = parseSrt(text);
            setSrtSubtitles(cues);
          })
          .catch((e) => {
            console.warn('Failed to fetch/parse srt in EnvScrollTemplate', e);
          });
      }
    } else {
      // if effective.subtitles present, use them
      setSrtSubtitles(effective.subtitles);
    }

    return () => {
      cancelled = true;
    };
  }, [effective.srt, effective.subtitles]);

  const displaySubtitles = srtSubtitles;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Background video full screen, low opacity with slow parallax */}
      {effective.bgVideo ? (
        <Video
          src={staticFile(effective.bgVideo)}
          startFrom={0}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            objectFit: 'cover',
            opacity: 1,
            transform: 'none',
            filter: 'none',
          }}
          muted={true}
        />
      ) : null}

      {/* Music and speech */}
      {effective.bgMusic ? <Audio src={staticFile(effective.bgMusic)} /> : null}
      {effective.speech ? <Audio src={staticFile(effective.speech)} /> : null}

      {/* Show current image (and previous for smooth exit) based on current frame */}
      {([currentIndex - 1, currentIndex]).map((i) => {
        if (i >= 0 && i < effective.images.length) {
          const start = i * slotFrames;
          const z = i === currentIndex ? 2 : 1;
          // horizontal parallax offset based on index and frame for subtle movement
          const parallaxX = ((i - currentIndex) * 60) + Math.sin((frame - start) / 30) * 8;
          return (
            <div key={`wrap-${effective.images[i]}`} style={{position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, pointerEvents: 'none', zIndex: z}}>
              <div style={{position: 'absolute', left: `${parallaxX}px`, top: 0, right: 0, bottom: 0}}>
                <ImagePanel src={effective.images[i]} startFrame={start} duration={perImageFrames} zIndex={z} />
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Glint overlay: moving white gradient to simulate glossy shine */}
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10}}>
        <div
          style={{
            position: 'absolute',
            width: '30%',
            height: '120%',
            left: `${(frame * 0.5) % 120 - 20}%`,
            top: '-10%',
            transform: 'skewX(-20deg)',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0) 100%)',
            filter: 'blur(12px)',
            mixBlendMode: 'screen',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Vignette */}
      <div style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 20}}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)'}} />
      </div>

      {/* Particle layer */}
      <ParticleLayer frame={frame} count={effective.particleCount} zIndex={15} />

      {/* Subtitles: render remotion-subtitle sequences if available, otherwise a simple active overlay */}
      {subtitleSequences ? <>{subtitleSequences}</> : null}

      {displaySubtitles && displaySubtitles.length > 0 && (() => {
        const active = displaySubtitles.filter((s) => {
          const startFrame = Math.floor((s.startSec ?? 0) * 30);
          const durFrames = Math.max(1, Math.floor((s.durationSec ?? 3) * 30));
          return frame >= startFrame && frame <= startFrame + durFrames;
        });
        return (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, zIndex: 3000, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
            {active.length > 0 && (
              <div style={{padding: '10px 18px', borderRadius: 10, background: 'rgba(0,0,0,0.65)', maxWidth: '88%'}}>
                <div style={{color: '#fff', fontSize: 48, textAlign: 'center', lineHeight: 1.1, whiteSpace: 'pre-wrap'}}>{active.map(a => a.text).join('\n')}</div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Debug overlay: shows current frame and subtitle count */}
      <div style={{position: 'absolute', right: 12, top: 12, zIndex: 2000, color: 'white', fontSize: 12, background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: 6}}>
        <div>frame: {frame}</div>
        <div>time: {(frame/30).toFixed(2)}s</div>
        <div>subtitles: {displaySubtitles ? displaySubtitles.length : 0}</div>
        <div>active: {displaySubtitles ? displaySubtitles.filter((s) => { const startFrame = Math.floor((s.startSec ?? 0) * 30); const durFrames = Math.max(1, Math.floor((s.durationSec ?? 3) * 30)); return frame >= startFrame && frame <= startFrame + durFrames; }).length : 0}</div>
        <div>source: {effective.subtitles ? 'config.subtitles' : (effective.srt ? 'srt' : 'none')}</div>
      </div>

    </AbsoluteFill>
  );
};

export default EnvScrollTemplate;
