import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Audio, staticFile} from 'remotion';

const headingStyle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 96,
  textAlign: 'center',
};

const subStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 56,
  textAlign: 'center',
};

export const MagicThreeAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // Background: transition from deep navy to soft sky-blue gradient
  const bgT = Math.min(1, frame / (fps * 0.6));
  const topR = Math.round(6 + bgT * (70 - 6));
  const topG = Math.round(12 + bgT * (150 - 12));
  const topB = Math.round(30 + bgT * (220 - 30));
  const bottomR = Math.round(2 + bgT * (18 - 2));
  const bottomG = Math.round(8 + bgT * (110 - 8));
  const bottomB = Math.round(28 + bgT * (200 - 28));
  const bgColor = `linear-gradient(180deg, rgb(${topR}, ${topG}, ${topB}) 0%, rgb(${bottomR}, ${bottomG}, ${bottomB}) 100%)`;

  // "别急！" drop-in and bounce
  const headerIn = frame - 2;
  const headerY = interpolate(headerIn, [0, 12, 28], [-300, 12, 0], {extrapolateRight: 'clamp'});
  const headerScale = interpolate(headerIn, [0, 12, 28], [1.15, 0.96, 1], {extrapolateRight: 'clamp'});

  // Big 3 zoom
  const threeStart = 18;
  const threeLocal = frame - threeStart;
  const threeScale = interpolate(threeLocal, [0, 8, 28], [0.2, 1.6, 1], {extrapolateRight: 'clamp'});
  const threeGlow = interpolate(threeLocal, [6, 16, 28], [0, 1, 0.4], {extrapolateRight: 'clamp'});

  // converging text
  const convergeStart = 26;
  const convergeLocal = frame - convergeStart;
  const leftX = interpolate(convergeLocal, [0, 12, 28], [-420, -40, 0], {extrapolateRight: 'clamp'});
  const rightX = interpolate(convergeLocal, [0, 12, 28], [420, 40, 0], {extrapolateRight: 'clamp'});

  // slash and CTA explosion
  const slashStart = 48;
  const slashLocal = frame - slashStart;
  const ctaScale = interpolate(slashLocal, [6, 12, 22], [0.9, 1.24, 1], {extrapolateRight: 'clamp'});

  // Layout calculations (approximate using font sizes)
  const threeFontSize = 240; // px
  const subFontSize = 56; // px for "步就能轻松搞定"
  const subLineHeight = 1.0;
  const textBlockHeight = Math.round(subFontSize * subLineHeight); // single-line
  const gapBetween3AndText = 40; // px

  // place converging text centered slightly above center (adjustable)
  const convergeCenterY = 0 + 16; // px from the composition center
  const convergeTop = Math.round(convergeCenterY - textBlockHeight / 2);
  const convergeBottom = Math.round(convergeCenterY + textBlockHeight / 2);

  // compute big 3 Y so its bottom sits gapBetween3AndText above the convergeTop
  const threeY = convergeTop - gapBetween3AndText - Math.round(threeFontSize / 2);

  // place explanatory and CTA below the converge bottom
  const explanatoryTop = convergeBottom + 186; // px below converge bottom
  const ctaTop = explanatoryTop + 188; // px below explanatory line

  return (
    <AbsoluteFill style={{background: bgColor, alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
      <Audio src={staticFile('static/audio/speech-jiebang.mp3')} />
      <div style={{position: 'absolute', top: 140, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${headerY}px) scale(${headerScale})`, color: '#FFB24D', ...headingStyle}}>别急！</div>
      </div>

      {/* Compute approximate text block height to position the big '3' above it */}
      {(() => {
        return (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            {/* Big 3 placed dynamically using computed Y */}
            <div style={{height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: threeFontSize, fontWeight: 900, color: '#ffffff', transform: `translateY(${threeY + 124}px) scale(${threeScale})`, textShadow: `0 30px 90px rgba(255,220,120,${threeGlow})`}}>3</div>
            </div>

            {/* converging text placed clearly below the big 3 */}
            <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220}}>
              <div style={{position: 'absolute', left: '50%', top: `${convergeTop}px`, transform: `translate(-50%, 0) translateX(${leftX}px)`, color: '#ffffff', ...subStyle}}>步就能轻松搞定</div>
            </div>
          </div>
        );
      })()}

        {/* slash and CTA - moved down further */}
        <div style={{marginTop: `${ctaTop}px`, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{color: 'rgba(255,255,255,0.8)', fontSize: 44}}>不用找原车主，</div>
          <div style={{transform: `scale(${ctaScale})`, color: '#ffffff', fontSize: 68, fontWeight: 900}}>直接解绑！</div>
        </div>

        {/* small explanatory line - now placed below the CTA */}
        <div style={{opacity: 0.9, color: 'rgba(255,255,255,0.9)', fontSize: 36, marginTop: 32}}>消除焦虑 · 简洁高效 · 快速解决</div>

        {/* decorative gears/arrows (simple SVG placeholders) */}
        <svg width={640} height={120} viewBox="0 0 640 120" style={{marginTop: 48, opacity: 0.15}}>
          <g fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M40 60h80M160 60h80M280 60h80M400 60h80M520 60h80" />
            <path d="M120 30l20 20-20 20" />
            <path d="M360 30l20 20-20 20" />
          </g>
        </svg>
    </AbsoluteFill>
  );
};

export default MagicThreeAnimation;
