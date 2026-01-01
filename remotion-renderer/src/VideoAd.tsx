import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const Exclamation: React.FC<{scale: number; opacity?: number}> = ({scale, opacity = 1}) => (
  <div
    style={{
      transform: `scale(${scale})`,
      opacity,
      color: "#fff",
      fontSize: 130,
      fontWeight: 800,
      lineHeight: 1,
      textAlign: "center",
      textShadow: "0 6px 18px rgba(0,0,0,0.25)",
    }}
  >
    !
  </div>
);

const RedCross: React.FC<{size?: number}> = ({size = 120}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FF3B30" />
    <path d="M7 7L17 17M17 7L7 17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WechatLogo: React.FC<{size?: number}> = ({size = 64}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect rx="8" width="48" height="48" fill="#7BB32E" />
    <circle cx="18" cy="21" r="6" fill="#fff" />
    <circle cx="30" cy="21" r="6" fill="#fff" />
    <circle cx="30" cy="21" r="2.5" fill="#7BB32E" />
    <circle cx="18" cy="21" r="2.5" fill="#7BB32E" />
  </svg>
);

export const VideoAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Frames for segments
  const f0 = 0;
  const fHookEnd = 60; // 0-2s
  const fPainEnd = 150; // 2-5s
  const fSolutionEnd = 300; //5-10s
  const fCTAEnd = 450; //10-15s

  // Hook animations
  const exclamScale = interpolate(frame, [f0, 12, 28, fHookEnd], [0, 1.3, 0.95, 1], {extrapolateRight: "clamp"});
  const hookTextY = interpolate(frame, [f0, 12, fHookEnd], [80, 0, -6], {extrapolateRight: "clamp"});

  // Pain animations
  const phoneX = interpolate(frame, [fHookEnd, fHookEnd + 12, fPainEnd], [800, 40, 0], {extrapolateRight: "clamp"});
  const errOpacity = interpolate(frame, [fHookEnd + 6, fHookEnd + 20, fPainEnd], [0, 1, 1], {extrapolateRight: "clamp"});

  // Solution animations
  const solTextX = interpolate(frame, [fPainEnd, fPainEnd + 12, fSolutionEnd], [900, 40, 0], {extrapolateRight: "clamp"});

  // CTA animations
  const searchBoxY = interpolate(frame, [fSolutionEnd, fSolutionEnd + 12, fCTAEnd], [200, 0, -6], {extrapolateRight: "clamp"});

  return (
    <AbsoluteFill style={{fontFamily: 'PingFang SC, -apple-system, Roboto, Helvetica, Arial'}}>
      {/* Segment 1: Hook 0-2s */}
      <AbsoluteFill style={{background: '#d92b2b', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', top: '30%', left: '50%', transform: `translate(-50%, ${hookTextY}px)`, color: '#fff', fontSize: 72, fontWeight: 700}}>
          刚买二手奔驰的注意！
        </div>
        <div style={{position: 'absolute', transform: `translate(-50%, -50%) scale(${exclamScale})`, left: '50%', top: '60%'}}>
          <Exclamation scale={exclamScale} />
        </div>
      </AbsoluteFill>

      {/* Segment 2: Pain 2-5s */}
      <AbsoluteFill style={{background: '#111316', alignItems: 'center', justifyContent: 'center', padding: 60}}>
        <div style={{position: 'absolute', left: phoneX, width: 420, height: 760, borderRadius: 36, background: '#0b0b0c', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: '84%', height: '70%', background: '#0f1720', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <div style={{color: '#fff', fontSize: 22, marginBottom: 18}}>手机 App</div>
            <div style={{width: '80%', height: 120, borderRadius: 12, background: '#171a1f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
              <RedCross size={68} />
              <div style={{color: '#fff', fontSize: 28, fontWeight: 700, opacity: errOpacity}}>访问拒绝</div>
            </div>
            <div style={{color: '#9aa0a6', marginTop: 20}}>账户未解绑 / 远程失效 模拟报错界面</div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Segment 3: Solution 5-10s */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg,#0b2a3a,#07202a)', alignItems: 'center', justifyContent: 'center', padding: 80}}>
        <div style={{position: 'absolute', left: solTextX, top: '20%', color: '#fff', maxWidth: 1100}}>
          <div style={{fontSize: 72, fontWeight: 800, marginBottom: 12}}>3步解绑</div>
          <div style={{fontSize: 36, marginBottom: 8}}>无需联系原车主</div>
          <div style={{fontSize: 28, color: '#d1eef7'}}>只需三步，安全解绑，立即恢复远程功能</div>
        </div>
        <div style={{position: 'absolute', right: 120, width: 700, height: 380, borderRadius: 12, background: '#031722', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
          <div style={{color: '#7ee1ff', fontSize: 48, fontWeight: 700}}>奔驰车机 UI 风格示意</div>
        </div>
      </AbsoluteFill>

      {/* Segment 4: CTA 10-15s */}
      <AbsoluteFill style={{background: '#061016', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', top: '20%', color: '#fff', fontSize: 56, fontWeight: 800}}>关注“嗨一查车”</div>
        <div style={{position: 'absolute', top: `40%`, transform: `translateY(${searchBoxY}px)`, display: 'flex', gap: 20, alignItems: 'center'}}>
          <div style={{width: 640, height: 90, background: '#0d2330', borderRadius: 46, display: 'flex', alignItems: 'center', padding: '0 24px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>
            <div style={{color: '#9fb8c3', marginRight: 14}}>微信</div>
            <div style={{flex: 1, color: '#fff', fontSize: 28}}>搜索 公众号：嗨一查车</div>
          </div>
          <div style={{width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <WechatLogo size={84} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoAd;
