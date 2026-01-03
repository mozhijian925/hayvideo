import React from 'react';
import {AbsoluteFill, Audio, staticFile, Img, Video, useCurrentFrame, interpolate} from 'remotion';

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
  images = ['static/bg-image/环保清单/1.jpg','static/bg-image/环保清单/2.png','static/bg-image/环保清单/3.png','static/bg-image/环保清单/4.jpg','static/bg-image/环保清单/5.jpg'],
  bgMusic = 'static/bg-music/bg1.mp3',
  bgVideo = 'static/bg-video/环保清单/huoche.mp4',
  speech = 'static/audio/speech.mp3',
  gapSec = 3,
  config,
}) => {
  const perImageSec = config?.perImageSec ?? 5; // seconds per image
  const perImageFrames = perImageSec * 30;
  const gapFrames = Math.max(0, Math.floor((config?.gapSec ?? gapSec) * 30));
  const slotFrames = perImageFrames + gapFrames;
  const frame = useCurrentFrame();
  const currentIndex = Math.floor(frame / slotFrames);

  return (
    <AbsoluteFill style={{background: '#000'}}>
          {/* Background video full screen, low opacity with slow parallax */}
          <Video
            src={staticFile(bgVideo)}
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

      {/* Music and speech */}
      <Audio src={staticFile(bgMusic)} />
      <Audio src={staticFile(speech)} />

      {/* Show current image (and previous for smooth exit) based on current frame */}
      {([currentIndex - 1, currentIndex]).map((i) => {
        if (i >= 0 && i < images.length) {
          const start = i * slotFrames;
          const z = i === currentIndex ? 2 : 1;
          // horizontal parallax offset based on index and frame for subtle movement
          const parallaxX = ((i - currentIndex) * 60) + Math.sin((frame - start) / 30) * 8;
          return (
            <div key={`wrap-${images[i]}`} style={{position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, pointerEvents: 'none', zIndex: z}}>
              <div style={{position: 'absolute', left: `${parallaxX}px`, top: 0, right: 0, bottom: 0}}>
                <ImagePanel src={images[i]} startFrame={start} duration={perImageFrames} zIndex={z} />
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
      <ParticleLayer frame={frame} count={40} zIndex={15} />

    </AbsoluteFill>
  );
};

export default EnvScrollTemplate;
