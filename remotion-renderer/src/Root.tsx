import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { MySimpleAnimation } from "./HelloWorld/MySimpleAnimation";
import {
  TextIssues,
  computeTextIssuesDuration,
  textIssuesSchema,
} from "./TextIssues";
import { NewCopyAnimation } from "./NewCopyAnimation";
import { MagicThreeAnimation } from "./MagicThreeAnimation";
import { MercedesSteps } from "./MercedesSteps";
import { CombinedAnimation } from "./CombinedAnimation";
import { EnvScrollTemplate } from "./EnvScrollTemplate";
import envconfig from "./envconfig.json";
import envconfigAlt from "./envconfig_alt.json";
import { envConfigSchema } from "./envconfig.schema";
import { ConfigSwitcher } from "./ConfigSwitcher";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#0a0a0a",
          logoColor1: "#479e99",
          logoColor2: "#162c55",
        }}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
      <Composition
        id="MySimpleAnimation"
        component={MySimpleAnimation}
        durationInFrames={90}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TextIssues"
        component={TextIssues}
        durationInFrames={330}
        fps={30}
        width={1080}
        height={1920}
        schema={textIssuesSchema}
        defaultProps={{
          lines: [
            "二手奔驰原车主没解绑",
            "Mercedes me 账户？",
            "车机用户名删不掉？",
          ],
          fontSize: 66,
          lineGap: 16,
          bgColor: "#071022",
          audioOffsetSec: 0,
          audioFile: "static/audio/speech.mp3",
          logoImage: "static/images/mercedes-benz-logo.png",
          appImage: "static/images/benz-app.jpg",
        }}
      />
      <Composition
        id="NewCopyAnimation"
        component={NewCopyAnimation}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MagicThreeAnimation"
        component={MagicThreeAnimation}
        durationInFrames={75}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="MercedesSteps"
        component={MercedesSteps}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CombinedAnimation"
        component={CombinedAnimation}
        durationInFrames={330 + 75 + 480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EnvScrollTemplate"
        component={EnvScrollTemplate}
        durationInFrames={30 * (5 + 3) * 5}
        fps={30}
        width={1080}
        height={1920}
        schema={envConfigSchema}
        defaultProps={{
          images: [
            "static/bg-image/环保清单/5.jpg",
            "static/bg-image/环保清单/2.png",
          ],
          bgMusic: "static/bg-music/embrace-364091.mp3",
          speech: "static/audio/speech-end.mp3",
          perImageSec: 4,
          gapSec: 2,
          particleCount: 24,
          subtitles: [
            {
              text: "结尾语：携手环保",
              startSec: 2,
              durationSec: 4,
              size: 52,
              bg: "rgba(0,0,0,0.6)",
            },
          ],
          srt: "static/srt/speech.srt",
        }}
      />
      <Composition
        id="EnvScrollTemplateAlt"
        component={EnvScrollTemplate}
        durationInFrames={30 * (4 + 2) * 3}
        fps={30}
        width={1080}
        height={1920}
        schema={envConfigSchema}
        defaultProps={{
          config: {
            images: [
              "static/bg-image/环保清单/5.jpg",
              "static/bg-image/环保清单/4.jpg",
              "static/bg-image/环保清单/3.png",
            ],
            bgMusic: "static/bg-music/embrace-364091.mp3",
            bgVideo: "static/bg-video/环保清单/huoche.mp4",
            speech: "static/audio/speech-end.mp3",
            perImageSec: 4,
            gapSec: 2,
            particleCount: 24,
          },
          images: [
            "static/bg-image/环保清单/5.jpg",
            "static/bg-image/环保清单/4.jpg",
            "static/bg-image/环保清单/3.png",
            "static/bg-image/环保清单/2.png",
            "static/bg-image/环保清单/1.jpg",
          ],
          bgMusic: "static/bg-music/embrace-364091.mp3",
        }}
      />
      <Composition
        id="EnvScrollTemplateDynamic"
        component={ConfigSwitcher}
        durationInFrames={30 * (5 + 3) * 5}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          defaultConfigName: "envconfig",
        }}
      />
    </>
  );
};
