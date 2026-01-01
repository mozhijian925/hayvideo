import React from "react";
import {AbsoluteFill, useCurrentFrame, interpolate} from "remotion";

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
}) => {
  const {
    lines = RAW_TEXT_LINES,
    fps = 30,
    lineDurSec = 3.0,
    overlapSec = 0.6,
    staggerFrames = 4,
    enterEndFrames = 20,
    marginFrames = 10,
  } = opts || {};

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
  const lineDurSec = 3.0;
  const overlapSec = 0.6;

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
      <div style={{width: '86%', maxWidth: 920}}>
        {lines.map((l, idx) => renderLine(l, idx))}
      </div>
    </AbsoluteFill>
  );
};

export default TextIssues;
