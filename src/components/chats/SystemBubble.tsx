import clsx from "clsx";
import { P, match } from "ts-pattern";
import { MarkdownContent } from "./MarkdownContent";

type AgnosticContent =
  | {
      content: string;
    }
  | { markdownContent: string };
type Variant = "information" | "alert";
type SystemBubbleProps = { variant: Variant } & AgnosticContent;

export const SystemBubble: React.FC<SystemBubbleProps> = ({
  variant,
  ...props
}) => (
  <div className="px-12 text-sm">
    <div
      className={clsx(
        "rounded-xl px-4 py-2",
        match(variant)
          .with("information", () => "bg-indigo-50")
          .with("alert", () => "bg-red-50")
          .exhaustive(),
      )}
    >
      <span
        className={clsx(
          "font-bold",
          match(variant)
            .with("information", () => "text-indigo-400")
            .with("alert", () => "text-red-400")
            .exhaustive(),
        )}
      >
        {match(variant)
          .with("information", () => "お知らせ")
          .with("alert", () => "エラーが発生しました")
          .exhaustive()}
      </span>
      {match(props)
        .with({ content: P._ }, ({ content }) => <p>{content}</p>)
        .with({ markdownContent: P._ }, ({ markdownContent }) => (
          <MarkdownContent>{markdownContent}</MarkdownContent>
        ))
        .exhaustive()}
    </div>
  </div>
);
