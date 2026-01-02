import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Sequence, Img, staticFile} from 'remotion';

const wrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 18,
  textAlign: 'center',
};

const lineStyle: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 800,
  fontSize: 72,
  lineHeight: '1.05',
  textShadow: '0 8px 28px rgba(0,0,0,0.35)'
};

const COPY_LINES = [
  '别急！3 步就能轻松搞定，',
  '不用找原车主，直接解绑！',
  '关注嗨一查车公众号，线上办理',
  '帮你彻底清除前车主信息！',
  '已经帮超多车友解决同款烦恼，靠谱到爆！',
  '有同款困扰的车友，赶紧在评论区留下你的车型！',
];

export const NewCopyAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const perLineDelay = 14; // frames
  const enterDur = 26; // frames

  return (
    <AbsoluteFill style={{background: '#08101a', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: '86%', maxWidth: 920}}>
        <div style={wrapper}>
          {COPY_LINES.map((text, idx) => {
            const start = idx * perLineDelay;
            const local = frame - start;
            const y = interpolate(local, [0, enterDur], [120, 0], {extrapolateRight: 'clamp'});
            const opacity = interpolate(local, [0, enterDur / 2, enterDur], [0, 1, 1], {extrapolateRight: 'clamp'});
            const scale = interpolate(local, [0, enterDur / 2, enterDur], [0.86, 1.06, 1], {extrapolateRight: 'clamp'});

            return (
              <div key={idx} style={{transform: `translateY(${y}px) scale(${scale})`, opacity}}>
                <div style={lineStyle}>{text}</div>
              </div>
            );
          })}

          {/* CTA pulse at the end */}
          <Sequence from={COPY_LINES.length * perLineDelay + 12}>
            <div style={{marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, justifyContent: 'center'}}>
              <div>
                <CTAPulse />
              </div>

              <LargeImg />
            </div>
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CTAPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - 240);
  const scale = interpolate(local % 60, [0, 15, 30, 60], [1, 1.08, 0.98, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
      <div style={{transform: `scale(${scale})`, transition: 'none'}}>
        <div style={{background: '#ffcf2d', color: '#08101a', padding: '14px 28px', borderRadius: 40, fontWeight: 800, fontSize: 40}}>关注嗨一查车公众号</div>
      </div>
      <div style={{color: 'rgba(255,255,255,0.7)', fontSize: 28}}>线上办理，一键解绑前车主信息</div>
    </div>
  );
};

const LargeImg: React.FC = () => {
  const frame = useCurrentFrame();
  const showAt = COPY_LINES.length * 14 + 12;
  const local = frame - showAt;
  const y = interpolate(local, [-10, 0, 20], [120, 0, -8], {extrapolateRight: 'clamp'});
  const opacity = interpolate(local, [-6, 0, 20], [0, 1, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(local % 90, [0, 20, 45, 90], [0.98, 1.06, 0.995, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{transform: `translateY(${y}px) scale(${scale})`, opacity, transition: 'none', display: 'flex', justifyContent: 'center'}}>
      <div style={{width: 720, maxWidth: '92vw', borderRadius: 28, overflow: 'hidden', boxShadow: '0 60px 180px rgba(0,0,0,0.6)'}}>
        <Img src={staticFile('static/images/haiyichache.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </div>
  );
};
export default NewCopyAnimation;
