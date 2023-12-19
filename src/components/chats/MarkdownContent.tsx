import { marked } from "marked";

type MarkdownContentProps = {
  children: string;
};
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  children,
}) => (
  <div
    className="markdown"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: marked is safe
    dangerouslySetInnerHTML={{
      __html: marked(children) as string,
    }}
  />
);
