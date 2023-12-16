import { PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/solid";
import { createId } from "@paralleldrive/cuid2";
import { useChat } from "ai/react";
import clsx from "clsx";
import { marked } from "marked";
import {
  ChangeEventHandler,
  FormEvent,
  startTransition,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link, useLoaderData, useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { match } from "ts-pattern";
import { array, optional, parse } from "valibot";
import { selectMessagesSchema, selectSessionSchema } from "../../db/schema";
import { SessionListItem } from "../components/SessionListItem";
import { SessionContext } from "../contexts/session";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => parse(array(selectSessionSchema), data.sessions));

const useSession = () => {
  const { sessionId: sessionIdInParam } = useParams<{ sessionId: string }>();
  const { sessionId, isNew } = useMemo(() => {
    return {
      sessionId: sessionIdInParam ?? createId(),
      isNew: sessionIdInParam == null,
    };
  }, [sessionIdInParam]);
  return { sessionId, isNew };
};
type Conversation = {
  id: string;
  request: string;
  response: string;
};
export const ConversationPage: React.FC = () => {
  const { data: sessionData, mutate } = useSWR("/api/sessions", fetcher);
  const { sessionId, isNew } = useSession();
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const { messages, input, append, setInput } = useChat({
    id: sessionId,
    api: "/api/conversation",
    body: {
      isNew,
      sessionId,
    },
    onResponse: () => {
      mutate();
    },
    onFinish: () => {
      mutate();
    },
    initialMessages: parse(
      optional(array(selectMessagesSchema)),
      loaderData,
    )?.map(({ id, role, content }) => ({
      id,
      role,
      content,
    })),
  });

  const conversations = useMemo(() => {
    const tmp: Conversation[] = [];
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
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (input.trim() === "") {
        return;
      }
      append({
        role: "user",
        content: input,
      });
      setInput("");
      navigate(`/sessions/${sessionId}`);
    },
    [input, setInput, append, sessionId, navigate],
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleInputChange = useCallback<
    ChangeEventHandler<HTMLTextAreaElement>
  >(
    (e) => {
      setInput(e.target.value);
      startTransition(() => {
        if (textareaRef != null && textareaRef.current != null) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      });
    },
    [setInput],
  );

  return (
    <SessionContext.Provider value={{ id: sessionId }}>
      <div className="flex h-screen bg-[#F6F3EE] overflow-hidden text-[#595959]">
        <aside className="w-1/4 p-4">
          <header>
            <h1 className="text-4xl pl-2 shion">Shion</h1>
          </header>
          <nav className="mt-4 space-y-8">
            <Link
              to="/"
              className=" hover:text-gray-900 px-4 py-2 hover:bg-[#FDF8F5] rounded-[30px] flex items-center space-x-2"
              aria-current="page"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New session</span>
            </Link>
            <section className="space-y-2">
              <h2 className="text-sm pl-4">Recent</h2>
              <ul className="space-y-4">
                {sessionData?.map(({ id, title }) => (
                  <SessionListItem key={id} id={id} title={title} />
                ))}
              </ul>
            </section>
          </nav>
        </aside>
        <main className="p-4 w-full">
          <div className="bg-gray-50 flex flex-col p-4 rounded-[30px] h-full space-y-4">
            <section className="h-full overflow-y-scroll">
              {conversations.length === 0 && (
                <article className="p-4 ">
                  <header className="text-2xl font-bold">
                    Welcome! I'm Shion
                  </header>
                  <p>
                    Your friendly AI companion. Let's chat and explore new
                    possibilities together.
                  </p>
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
                <div className="flex space-x-2 justify-center">
                  <label className="bg-white px-6 py-4 flex items-center rounded-[30px] border-[#BDBDBD] border hover:border-[#757575] focus-within:border-[#757575] w-2/3 transition-[height]">
                    <textarea
                      className="outline-none w-full resize-none text-lg transition-all"
                      onChange={handleInputChange}
                      value={input}
                      rows={1}
                      ref={textareaRef}
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
        </main>
      </div>
    </SessionContext.Provider>
  );
};
