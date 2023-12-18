import {
  GlobeAsiaAustraliaIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useCallback, useState } from "react";
import { useFetcher } from "react-router-dom";
import { match } from "ts-pattern";
import { nonOptional, parse } from "valibot";
import { Session, insertSessionSchema } from "../../../../db/schema";

type VisibilitySettingButtonProps = {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  value: Session["visibility"];
  onClick: (value: Session["visibility"]) => void;
};
const VisibilitySettingButton: React.FC<VisibilitySettingButtonProps> = ({
  icon,
  title,
  description,
  selected,
  value,
  onClick,
}) => {
  return (
    <button
      type="button"
      className={clsx(
        "py-2 w-full px-2 rounded-xl",
        selected ? "bg-[#fbe6d2]" : "hover:bg-[#FDF8F5]",
      )}
      onClick={() => onClick(value)}
    >
      <div className="flex items-center space-x-1">
        {icon}
        <span>{title}</span>
        {selected && (
          <span className="px-1 text-xs bg-[#F6F3EE] rounded font-bold">
            現在設定中
          </span>
        )}
      </div>
      <p className="text-xs text-left pl-6">{description}</p>
    </button>
  );
};

type VisibilitySettingProps = {
  currentVisibility: Session["visibility"];
};
export const VisibilitySetting: React.FC<VisibilitySettingProps> = ({
  currentVisibility,
}) => {
  const fetcher = useFetcher();
  const visibility = match(fetcher.state)
    .with("idle", () => currentVisibility)
    .otherwise(() => {
      return parse(
        nonOptional(insertSessionSchema.entries.visibility),
        fetcher?.formData?.get("visibility"),
      );
    });

  const handleChange = useCallback(
    (newVisibility: Session["visibility"]) => {
      const formData = new FormData();
      formData.append("visibility", newVisibility);
      fetcher.submit(formData, {
        method: "PUT",
      });
      setOpen(false);
    },
    [fetcher],
  );
  const [open, setOpen] = useState(false);
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
  }, []);

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex items-center flex-shrink-0 space-x-1 cursor-pointer relative pr-8"
          disabled={
            fetcher.state === "submitting" || fetcher.state === "loading"
          }
        >
          {match(visibility)
            .with("public", () => (
              <>
                <GlobeAsiaAustraliaIcon className="w-5 h-5" />
                <span className="text-sm">みんなに公開</span>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  defaultChecked={true}
                  className="hidden"
                />
              </>
            ))
            .with("private", () => (
              <>
                <LockClosedIcon className="w-5 h-5" />
                <span className="text-sm">自分だけ</span>
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  defaultChecked={true}
                  className="hidden"
                />
              </>
            ))
            .exhaustive()}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={10}>
          <AnimatePresence>
            <motion.div
              className="bg-white drop-shadow-lg p-4 rounded-xl w-[350px] flex flex-col text-sm text-[#595959] space-y-2"
              initial={{
                y: 10,
              }}
              animate={{ y: 0 }}
              exit={{ y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <header className="flex items-center justify-between">
                <p>公開範囲の設定</p>
              </header>
              <div className="space-y-2">
                <VisibilitySettingButton
                  icon={<LockClosedIcon className="w-5 h-5" />}
                  title="自分だけ"
                  description="あなた以外はこの会話を閲覧できません。悩んだらこちらを選んでおけばOKです。"
                  selected={visibility === "private"}
                  onClick={handleChange}
                  value="private"
                />
                <VisibilitySettingButton
                  icon={<GlobeAsiaAustraliaIcon className="w-5 h-5" />}
                  title="みんなに公開"
                  description="「みんなの会話」にこの会話が表示されます。会話を共有したい時はこちらを使いましょう。"
                  onClick={handleChange}
                  selected={visibility === "public"}
                  value="public"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
