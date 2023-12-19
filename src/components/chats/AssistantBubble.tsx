import { P, match } from "ts-pattern";
import { MarkdownContent } from "./MarkdownContent";

type AssistantBubbleProps =
  | {
      content: string;
    }
  | { markdownContent: string };
export const AssistantBubble: React.FC<AssistantBubbleProps> = (props) => (
  <div className="bg-white rounded-[30px] p-8">
    {match(props)
      .with({ content: P._ }, ({ content }) => <p>{content}</p>)
      .with({ markdownContent: P._ }, ({ markdownContent }) => (
        <MarkdownContent>{markdownContent}</MarkdownContent>
      ))
      .exhaustive()}
  </div>
);
