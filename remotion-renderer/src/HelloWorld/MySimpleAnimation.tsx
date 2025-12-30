import {interpolate, useCurrentFrame} from 'remotion';
import React from 'react';

export const MySimpleAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  // Logo缩放动画，0~30帧从0.5缩放到1
  const scale = interpolate(frame, [0, 30], [0.5, 1], {extrapolateRight: 'clamp'});
  // 文字淡入，15~45帧从0到1
  const opacity = interpolate(frame, [15, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{flex: 1, background: '#222', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
      <div style={{transform: `scale(${scale})`, transition: 'transform 0.2s'}}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="#61dafb" />
          <text x="60" y="70" textAnchor="middle" fontSize="40" fill="#222">Hi</text>
        </svg>
      </div>
      <div style={{marginTop: 40, color: '#fff', fontSize: 32, opacity, transition: 'opacity 0.2s'}}>
        欢迎使用Remotion动画！
      </div>
    </div>
  );
};
