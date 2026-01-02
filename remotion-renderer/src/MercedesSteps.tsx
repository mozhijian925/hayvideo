import React, {useEffect, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, staticFile, Audio, Sequence} from 'remotion';

const stepTextStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 40,
  textAlign: 'center',
};

export const MercedesSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Each step gets 18 frames (~0.6s) in a 60-frame timeline, with small fades
  // Animation total changed to include ending audio; keep per-step duration at 90 frames,
  // and make ending 6 seconds (180 frames)
  const stepDur = 90; // each step ~3s
  const endDur = 210; // 7s ending
  const total = stepDur * 3 + endDur; // 480 frames total

  const stepIndex = Math.min(2, Math.floor(frame / stepDur));

  // progress within current step [0,1]
  const local = frame - stepIndex * stepDur;
  const t = Math.max(0, Math.min(1, local / stepDur));

  // general fade/scale for the current step using smoother easing
  const stepOpacity = interpolate(t, [0, 0.08, 0.85, 1], [0, 1, 1, 0.98]);
  const scale = interpolate(t, [0, 0.18, 0.6, 1], [0.86, 1.08, 1.02, 1]);
  const rotate = interpolate(t, [0, 0.12, 1], [6, -2, 0]);

  const steps = [
    {
      title: '1、打开微信搜【嗨一查车】关注',
      img: staticFile('static/images/step1.jpg'),
    },
    {
      title: '2、直接回复 “奔驰” 两个字',
      img: staticFile('static/images/step2.png'),
    },
    {
      title: '3、上传资料，后台就能帮你处理',
      img: staticFile('static/images/step3.png'),
    },
  ];
  const endImg = staticFile('static/images/end.png');

  // preload natural sizes for images so we can display at original dimensions
  const [sizes, setSizes] = useState<Array<{w: number; h: number}>>([]);
  const [endSize, setEndSize] = useState<{w: number; h: number} | null>(null);
  useEffect(() => {
    steps.forEach((s, idx) => {
      const img = new window.Image();
      img.src = s.img as string;
      img.onload = () => {
        setSizes((prev) => {
          const next = prev.slice();
          next[idx] = {w: img.naturalWidth, h: img.naturalHeight};
          return next;
        });
      };
    });
    const eimg = new window.Image();
    eimg.src = endImg as string;
    eimg.onload = () => {
      setEndSize({w: eimg.naturalWidth, h: eimg.naturalHeight});
    };
  }, []);

  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b2a4a,#0a5a8a)', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>

      {steps.map((s, i) => {
        const visible = i === stepIndex;
        if (!visible) {
          return null;
        }
        const op = visible ? stepOpacity : 0;
        const sc = visible ? scale : 0.96;
        const rt = visible ? rotate : 0;

        // natural size (fallback to previous container)
        const nat = sizes[i] ?? {w: 720, h: 420};
        const compW = 1080;
        const compH = 1920;
        const maxW = compW * 0.85; // leave some margin
        const maxH = compH * 0.45;

        // enlarge by 30% then clamp to maxW/maxH to avoid overflow
        const enlargeFactor = 1.3;
        let desiredW = nat.w * enlargeFactor;
        let desiredH = nat.h * enlargeFactor;
        const wRatio = maxW / desiredW;
        const hRatio = maxH / desiredH;
        const shrinkRatio = Math.min(1, wRatio, hRatio);
        let displayW = Math.round(desiredW * shrinkRatio);
        let displayH = Math.round(desiredH * shrinkRatio);

        const offsetY = (i - stepIndex) * (displayH + 40);

        return (
          <div key={i} style={{position: 'absolute', top: '20%', left: '50%', transform: `translate(-50%, ${offsetY}px) scale(${sc})`, width: displayW + 100, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: op}}>
            <div style={{width: displayW, height: displayH, overflow: 'visible', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: displayW, height: displayH, overflow: 'hidden', borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', transform: `rotate(${rt}deg) scale(${1})`}}>
                <img src={s.img} style={{width: displayW, height: displayH, objectFit: 'contain'}} alt={s.title} />
              </div>
              {/* decorative glow */}
              <div style={{position: 'absolute', width: displayW + 80, height: displayH + 80, borderRadius: 40, filter: 'blur(40px)', background: 'radial-gradient(circle at center, rgba(255,190,90,0.14), transparent 40%)', pointerEvents: 'none'}} />
            </div>
            {/* Step badge - frame-driven animation */}
            {frame < stepDur * 3 ? (
              <div style={{position: 'absolute', right: 'calc(50% - ' + (displayW / 2) + 'px + 28px)', top: `calc(20% - ${displayH / 2}px - 140px)`, pointerEvents: 'none'}}>
                {/* Only render the active badge */}
                {(() => {
                  const badgeIdx = stepIndex;
                  const isActive = true;
                  const badgeStart = badgeIdx * stepDur;
                  const badgeLocal = Math.max(0, Math.min(stepDur, frame - badgeStart));
                  const bp = badgeLocal / stepDur; // 0..1
                  const badgeScale = interpolate(bp, [0, 0.18, 0.45, 1], [0.6, 1.18, 0.96, 1.04]);
                  const badgeOpacity = interpolate(bp, [0, 0.18, 0.6, 1], [0, 1, 0.95, 0.9]);
                  const badgeTranslateY = isActive ? interpolate(bp, [0, 0.2, 1], [-12, 8, 0]) : 0;
                  return (
                    <div style={{transform: `translateY(${badgeTranslateY}px) scale(${badgeScale})`, opacity: badgeOpacity, display: 'flex', alignItems: 'center', gap: 12}}>
                      <div style={{width: 120, height: 120, borderRadius: 60, background: '#FFB24D', color: '#1b1b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44}}>{badgeIdx + 1}</div>
                      <div style={{color: '#fff', fontSize: 40, fontWeight: 900, letterSpacing: 0.6}}>{`步骤${['一','二','三'][badgeIdx]}`}</div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
            {/* remove per-image small caption; render centralized large step title below the image area */}
          </div>
        );
      })}

      {/* Ending sequence: show end.png after steps finish */}
      {frame >= stepDur * 3 ? (
        (() => {
          const endLocal = frame - stepDur * 3; // 0..endDur
          const et = Math.max(0, Math.min(1, endLocal / endDur));
          const endOpacity = interpolate(et, [0, 0.15, 0.8, 1], [0, 1, 1, 1]);
          const endScale = interpolate(et, [0, 0.18, 1], [0.92, 1.08, 1]);
          const nat = endSize ?? {w: 800, h: 450};
          const compW = 1080;
          const compH = 1920;
          const maxW = compW * 0.9;
          const maxH = compH * 0.65;
          const wRatio = maxW / nat.w;
          const hRatio = maxH / nat.h;
          const ratio = Math.min(1, wRatio, hRatio);
          const displayW = Math.round(nat.w * ratio);
          const displayH = Math.round(nat.h * ratio);

          return (
            <div style={{position: 'absolute', top: '12%', left: '50%', transform: `translate(-50%, 0) scale(${endScale})`, width: displayW, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: endOpacity}}>
              <div style={{width: displayW, height: displayH, overflow: 'hidden', borderRadius: 24, boxShadow: '0 40px 120px rgba(0,0,0,0.6)'}}>
                <img src={endImg} style={{width: displayW, height: displayH, objectFit: 'contain'}} alt="end" />
              </div>
            </div>
          );
        })()
      ) : null}

      {/* Large centered step title (not overlapping image) — hidden during ending */}
      {frame < stepDur * 3 ? (
        <div style={{position: 'absolute', bottom: 160, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <div style={{fontSize: 64, fontWeight: 900, color: '#FFFFFF', textAlign: 'center'}}>{['步骤一：打开微信搜【嗨一查车】关注', '步骤二：直接回复“奔驰”', '步骤三：上传资料，后台帮你处理'][stepIndex]}</div>
        </div>
      ) : null}

      {/* small progress dots — hidden during ending */}
      <Audio src={staticFile('static/audio/speech-step.mp3')} />
      {/* ending audio: play speech-end.mp3 during the ending duration */}
      <Sequence from={stepDur * 3} durationInFrames={endDur}>
        <Audio src={staticFile('static/audio/speech-end.mp3')} />
      </Sequence>
      {frame < stepDur * 3 ? (
        <div style={{position: 'absolute', bottom: 40, display: 'flex', gap: 12}}>
          {steps.map((_, i) => {
            const active = i === stepIndex;
            const dotScale = active ? 1.25 : 0.9;
            const dotOpacity = active ? 1 : 0.45;
            return <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: '#fff', opacity: dotOpacity, transform: `scale(${dotScale})`}} />;
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export default MercedesSteps;
