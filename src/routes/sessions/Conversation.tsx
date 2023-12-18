import { useParseLoaderData } from "@/hooks/useParseLoaderData";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import {
  GlobeAsiaAustraliaIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import * as Popover from "@radix-ui/react-popover";
import { useChat } from "ai/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import {
  ChangeEventHandler,
  FormEvent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import { match } from "ts-pattern";
import { optional } from "valibot";
import { useSession } from "../../contexts/session";
import { sessionLoaderSchema } from "./_route";

type ConversationItem = {
  id: string;
  request: string;
  response: string;
};

export const Conversation: React.FC = () => {
  const { id, isNew } = useSession();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const loaderData = useParseLoaderData(optional(sessionLoaderSchema));
  const { messages, input, append, setInput } = useChat({
    id,
    api: "/api/conversation",
    body: {
      isNew,
      sessionId: id,
    },
    initialMessages: loaderData?.session.messages.map(
      ({ id, role, content }) => ({
        id,
        role,
        content,
      }),
    ),
    onResponse: () => {
      revalidator.revalidate();
    },
    onFinish: () => {
      revalidator.revalidate();
    },
  });
  const welcomeMessage = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) {
      return "おはようございます。";
    }
    if (hour >= 12 && hour < 18) {
      return "こんにちは。";
    }
    return "こんばんは。";
  }, []);
  const conversations = useMemo(() => {
    const tmp: ConversationItem[] = [];
    let lastRequestContent = "";
    let lastRequestId = "";

    for (const message of messages) {
      match(message)
        .with({ role: "user" }, ({ id, content }) => {
          lastRequestContent = content;
          lastRequestId = id;
        })
        .with({ role: "assistant" }, ({ id, content }) => {
          tmp.push({
            id: `${lastRequestId}-${id}`,
            request: lastRequestContent,
            response: content,
          });
          lastRequestId = "";
          lastRequestContent = "";
        });
    }
    if (lastRequestId !== "") {
      tmp.push({
        id: `${lastRequestId}-last`,
        request: lastRequestContent,
        response: "",
      });
    }
    return tmp;
  }, [messages]);
  const startConversation = useCallback(() => {
    if (input.trim() === "") {
      return;
    }

    append({
      role: "user",
      content: input,
    });
    setInput("");
    navigate(`/sessions/${id}`);
  }, [append, input, navigate, id, setInput]);
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      startConversation;
    },
    [startConversation],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleInputChange = useCallback<
    ChangeEventHandler<HTMLTextAreaElement>
  >(
    (e) => {
      setInput(e.target.value);
      if (textareaRef != null && textareaRef.current != null) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    },
    [setInput],
  );

  return (
    <div className="bg-gray-50 flex flex-col p-4 rounded-[30px] h-full space-y-4">
      <header className="flex justify-end px-4">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="flex items-center flex-shrink-0 space-x-1 cursor-pointer">
              <LockClosedIcon className="w-5 h-5" />
              <span className="text-sm">自分だけ</span>
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
                    <button className="py-2 w-full bg-[#fbe6d2] px-2 rounded-xl">
                      <div className="flex items-center space-x-1">
                        <LockClosedIcon className="w-5 h-5" />
                        <span>自分だけ</span>
                        <span className="px-1 text-xs bg-[#F6F3EE] rounded font-bold">
                          現在設定中
                        </span>
                      </div>
                      <p className="text-xs text-left pl-6">
                        あなた以外はこの会話を閲覧できません。悩んだらこちらを選んでおけばOKです。
                      </p>
                    </button>
                    <button className="items-center py-2 px-2 w-full rounded-xl hover:bg-[#FDF8F5]">
                      <div className="flex items-center space-x-1">
                        <GlobeAsiaAustraliaIcon className="w-5 h-5" />
                        <span>みんなに公開</span>
                      </div>
                      <p className="text-xs text-left pl-6">
                        「みんなの会話」にこの会話が表示されます。会話を共有したい時はこちらを使いましょう。
                      </p>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </header>
      <section className="h-full overflow-y-scroll">
        {conversations.length === 0 && (
          <article className="p-4 ">
            <header className="text-2xl">
              {welcomeMessage}LLM実行環境のシオンです。
            </header>
            <p>どんなことをお手伝いしましょうか？</p>
          </article>
        )}

        {conversations.map(({ id, request, response }) => (
          <article className="p-4  space-y-4 text-lg" key={id}>
            <p>{request}</p>
            <div
              className="bg-white rounded-[30px] p-8 markdown"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: marked is safe
              dangerouslySetInnerHTML={{
                __html: marked(response) as string,
              }}
            />
          </article>
        ))}
      </section>
      <section className="mt-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2 justify-center items-center px-2">
            <label className="bg-white px-6 py-4 flex items-center rounded-[30px] border-[#BDBDBD] border hover:border-[#757575] focus-within:border-[#757575] w-full">
              <textarea
                className="outline-none w-full resize-none pr-4"
                onChange={handleInputChange}
                value={input}
                rows={1}
                ref={textareaRef}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    startConversation();
                  }
                }}
              />
              <button
                type="submit"
                className={clsx(
                  input.trim().length === 0 ? "text-gray-300" : "",
                )}
                disabled={input.trim().length === 0}
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </label>
          </div>
        </form>
      </section>
    </div>
  );
};
