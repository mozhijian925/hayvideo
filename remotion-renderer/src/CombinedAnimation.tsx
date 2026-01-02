import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {TextIssues, computeTextIssuesDuration} from './TextIssues';
import {TEXT_ISSUES_TOTAL_FRAMES} from './TextIssues';
import {MagicThreeAnimation} from './MagicThreeAnimation';
import {MercedesSteps} from './MercedesSteps';

// CombinedAnimation sequences MagicThreeAnimation then MercedesSteps back-to-back.
export const CombinedAnimation: React.FC = () => {
  const textIssuesFrames = TEXT_ISSUES_TOTAL_FRAMES; // 330 frames (11s)
  const magicFrames = 75;
  const mercedesFrames = 480;

  // Layout: TextIssues (0..textIssuesFrames-1), Magic (textIssuesFrames..+magicFrames-1), Mercedes (next)
  const magicFrom = TEXT_ISSUES_TOTAL_FRAMES; // fixed 330 frames
  const mercedesFrom = magicFrom + magicFrames;

  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      <Sequence from={0} durationInFrames={textIssuesFrames}>
        <TextIssues />
      </Sequence>

      <Sequence from={magicFrom} durationInFrames={magicFrames}>
        <MagicThreeAnimation />
      </Sequence>

      <Sequence from={mercedesFrom} durationInFrames={mercedesFrames}>
        <MercedesSteps />
      </Sequence>
    </AbsoluteFill>
  );
};

export default CombinedAnimation;
