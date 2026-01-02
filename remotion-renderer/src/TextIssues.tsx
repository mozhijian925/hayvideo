import React from "react";
import {AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img, Audio, Sequence} from "remotion";

const lineStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 800,
  textAlign: 'center',
  textShadow: '0 6px 18px rgba(0,0,0,0.25)'
};

export const RAW_TEXT_LINES = [
  "二手奔驰原车主没解绑",
  "Mercedes me 账户？",
  "车机用户名删不掉？",
  "手机APP远程控制用不了？",
  "想联系对方还查无此人？",
];

export const computeTextIssuesDuration = (opts?: {
  lines?: string[];
  fps?: number;
  lineDurSec?: number;
  overlapSec?: number;
  staggerFrames?: number;
  enterEndFrames?: number;
  marginFrames?: number;
  // when true, return the project's fixed default total (TEXT_ISSUES_TOTAL_FRAMES)
  forceDefault?: boolean;
}) => {
  const {
    lines = RAW_TEXT_LINES,
    fps = 30,
    lineDurSec = 2.0,
    overlapSec = 0.4,
    staggerFrames = 3,
    enterEndFrames = 12,
    marginFrames = 10,
  } = opts || {};

  // If caller explicitly requests the fixed project default, return it.
  if (opts && opts.forceDefault) {
    return TEXT_ISSUES_TOTAL_FRAMES;
  }

  const splitByPunctuationLocal = (s: string) => {
    const re = /([^，。！？；：,.!?:;]+[，。！？；：,.!?:;]?)/g;
    const matches = s.match(re);
    if (!matches) return [s];
    return matches.map((m) => m.trim()).filter(Boolean);
  };

  const segments = lines.flatMap((r) => splitByPunctuationLocal(r));

  let maxFrame = 0;
  segments.forEach((seg, index) => {
    const startSec = index * (lineDurSec - overlapSec);
    const start = Math.round(startSec * fps);
    const chars = Array.from(seg);
    const lastCharIndex = Math.max(0, chars.length - 1);
    const lastCharEnterFrame = start + lastCharIndex * staggerFrames + enterEndFrames;
    if (lastCharEnterFrame > maxFrame) maxFrame = lastCharEnterFrame;
  });

  return maxFrame + marginFrames;
};

// Project-wide fixed total for TextIssues (10.5s @ 30fps)
export const TEXT_ISSUES_TOTAL_FRAMES = 330;

export const TextIssues: React.FC = () => {
  const frame = useCurrentFrame();

  const rawLines = RAW_TEXT_LINES;

  // Split each raw line by punctuation (keep punctuation at end of segment)
  const splitByPunctuation = (s: string) => {
    const re = /([^，。！？；：,.!?:;]+[，。！？；：,.!?:;]?)/g;
    const matches = s.match(re);
    if (!matches) return [s];
    return matches.map((m) => m.trim()).filter(Boolean);
  };

  const lines = rawLines.flatMap((r) => splitByPunctuation(r));

  const fps = 30;
  const lineDurSec = 2.0;
  const overlapSec = 0.4;
  const fontSize = 70; // px used in render
  const lineGap = 18; // marginTop between lines
  const textBlockHeight = lines.length * fontSize + Math.max(0, lines.length - 1) * lineGap;

  const renderLine = (text: string, index: number) => {
    const startSec = index * (lineDurSec - overlapSec);
    const start = Math.round(startSec * fps);
    const chars = Array.from(text);
    return (
      <div key={index} style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: index === 0 ? 0 : 18}}>
        {chars.map((ch, i) => {
                const stagger = i * 4; // frames between chars (slightly larger)
                const charFrame = frame - start - stagger;
                const enterStart = 0;
                const enterMid = 10; // overshoot peak
                const enterEnd = 20; // slower settle

                // Y: overshoot from 80 -> -8 -> 0
                const y = interpolate(charFrame, [enterStart, enterMid, enterEnd], [80, -12, 0], {extrapolateRight: 'clamp'});
                // Opacity: fade in quicker
                const opacity = interpolate(charFrame, [enterStart, enterStart + 6, enterMid, enterEnd], [0, 1, 0.95, 1], {extrapolateRight: 'clamp'});
                // Scale: stronger overshoot
                const scale = interpolate(charFrame, [enterStart, enterMid, enterEnd], [0.6, 1.32, 1], {extrapolateRight: 'clamp'});
                // Rotation: small tilt oscillation
                const rotate = interpolate(charFrame, [enterStart, enterMid, enterEnd], [20, -8, 0], {extrapolateRight: 'clamp'});

                const glow = `0 6px 24px rgba(126, 225, 255, ${Math.min(1, opacity) * 0.9})`;

                return (
                  <div
                    key={i}
                    style={{
                      transform: `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
                      opacity,
                      fontSize: 70,
                      ...lineStyle,
                      whiteSpace: 'pre',
                      textShadow: `${glow}, 0 6px 18px rgba(0,0,0,0.25)`,
                      filter: `blur(${(1 - Math.min(1, opacity)) * 2}px)`,
                      transition: 'none',
                    }}
                  >
                    {ch}
                  </div>
                );
        })}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: '#0b1220', alignItems: 'center', justifyContent: 'center'}}>
      {/* Play narration/audio from public/static/audio/speech.mp3 */}
      {/* If audio is out of sync, adjust AUDIO_OFFSET_SEC to delay/advance audio start */}
      {(() => {
        const AUDIO_OFFSET_SEC = 0; // set negative to start earlier, positive to delay (seconds)
        const AUDIO_OFFSET_FRAMES = Math.round(AUDIO_OFFSET_SEC * 30);
        if (AUDIO_OFFSET_FRAMES === 0) {
          return <Audio src={staticFile('static/audio/speech.mp3')} />;
        }
        return (
          <Sequence from={AUDIO_OFFSET_FRAMES}>
            <Audio src={staticFile('static/audio/speech.mp3')} />
          </Sequence>
        );
      })()}
      {/* Logo positioned above the text block (use computed textBlockHeight) */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 3}}>
        <div style={{position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 900, height: 900, transform: `translateY(-${Math.round(textBlockHeight / 2 + 280)}px)`}}>
          <div style={{position: 'absolute', width: 820, height: 820, borderRadius: 9999, background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.0) 60%)', filter: 'blur(18px)'}} />
          <Img
            src={staticFile('static/images/mercedes-benz-logo.png')}
            style={{
              width: 700,
              height: 700,
              opacity: 0.14,
              objectFit: 'contain',
              filter: 'grayscale(1)'
            }}
          />
        </div>
      </AbsoluteFill>

      <div style={{width: '86%', maxWidth: 920, position: 'relative', zIndex: 1}}>
        {lines.map((l, idx) => renderLine(l, idx))}
      </div>

      {/* App demo + cross-out sequence */}
      {(() => {
        const baseEnd = computeTextIssuesDuration();
        const appStart = baseEnd + 8; // start shortly after text ends
        const appFrame = frame - appStart;
        const showApp = appFrame >= 0;
        const imgScale = showApp
          ? interpolate(appFrame, [0, 12, 36], [0.6, 1.08, 1], {extrapolateRight: 'clamp'})
          : 0.6;
        const imgOpacity = showApp ? interpolate(appFrame, [0, 8, 24], [0, 1, 1], {extrapolateRight: 'clamp'}) : 0;

        const crossFrame = frame - (appStart + 36); // cross appears ~1.2s after app
        const showCross = crossFrame >= 0;
        const crossOpacity = showCross ? interpolate(crossFrame, [0, 6, 18], [0, 1, 1], {extrapolateRight: 'clamp'}) : 0;
        const crossScale = showCross ? interpolate(crossFrame, [0, 6, 18], [0.6, 1.2, 1], {extrapolateRight: 'clamp'}) : 0.6;

        if (!showApp) return null;

        return (
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 4}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
              <div style={{position: 'relative', width: 640, height: 1160, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Img
                  src={staticFile('static/images/benz-app.jpg')}
                  style={{width: 600, height: 1120, objectFit: 'cover', borderRadius: 36, transform: `scale(${imgScale})`, opacity: imgOpacity, boxShadow: '0 40px 120px rgba(0,0,0,0.7)'}}
                />

                {/* Red X overlay */}
                <svg width={600} height={1120} viewBox={`0 0 600 1120`} style={{position: 'absolute', left: 0, top: 0, opacity: crossOpacity, transform: `scale(${crossScale})`}}>
                  <rect width="600" height="1120" fill="rgba(0,0,0,0.0)" />
                  <line x1="80" y1="80" x2="520" y2="1040" stroke="#FF3B30" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="520" y1="80" x2="80" y2="1040" stroke="#FF3B30" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}
    </AbsoluteFill>
  );
};

export default TextIssues;
