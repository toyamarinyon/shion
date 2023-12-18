import { useParseLoaderData } from "@/hooks/useParseLoaderData";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useChat } from "ai/react";
import clsx from "clsx";
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
import { useSession } from "../../contexts/session";
import { sessionLoaderSchema } from "./_route";
import { VisibilitySetting } from "./components/VisivilitySetting";

type ConversationItem = {
  id: string;
  request: string;
  response: string;
};

export const Conversation: React.FC = () => {
  const { id, isNew } = useSession();
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const { session } = useParseLoaderData(sessionLoaderSchema);
  const { messages, input, append, setInput } = useChat({
    id,
    api: "/api/conversation",
    body: {
      isNew,
      sessionId: id,
    },
    initialMessages: session.messages.map(({ id, role, content }) => ({
      id,
      role,
      content,
    })),
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
      {conversations.length > 0 && (
        <header className="flex justify-end px-4 relative pr-7">
          <VisibilitySetting currentVisibility={session.visibility} />
        </header>
      )}
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