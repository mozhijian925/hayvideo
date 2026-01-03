import {z} from 'zod';

export const envConfigSchema = z.object({
  images: z.array(z.string()).min(1).describe('List of image paths under static/'),
  bgMusic: z.string().describe('Background music path under static/'),
  bgVideo: z.string().optional().describe('Background video path under static/'),
  speech: z.string().optional().describe('Speech/audio path under static/'),
  perImageSec: z.number().min(0).default(5).describe('Seconds each image is shown'),
  gapSec: z.number().min(0).default(3).describe('Gap seconds between images'),
  particleCount: z.number().min(0).default(30).describe('Number of particles in particle layer'),
  subtitles: z
    .array(
      z.object({
        text: z.string().describe('Subtitle text'),
        startSec: z.number().min(0).describe('Start time in seconds'),
        durationSec: z.number().min(0).describe('Duration in seconds'),
        size: z.number().optional().describe('Font size in px'),
        color: z.string().optional().describe('Text color'),
        bg: z.string().optional().describe('Background color for subtitle bubble'),
      })
    )
    .optional()
    .describe('Optional subtitles to display over the video'),
  srt: z.string().optional().describe('Path to an SRT file under static/ (e.g. static/srt/speech.srt)'),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;
