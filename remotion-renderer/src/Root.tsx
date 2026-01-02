import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { MySimpleAnimation } from "./HelloWorld/MySimpleAnimation";
import { TextIssues, computeTextIssuesDuration } from "./TextIssues";
import { NewCopyAnimation } from './NewCopyAnimation';
import { MagicThreeAnimation } from './MagicThreeAnimation';
import { MercedesSteps } from './MercedesSteps';
import { CombinedAnimation } from './CombinedAnimation';

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
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
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
    </>
  );
};
