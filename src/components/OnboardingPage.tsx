import { PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useCallback, useMemo, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { match } from "ts-pattern";
import { useAccess } from "../contexts/access";
import { useAuth } from "../contexts/auth";

type OnboardingState =
  | {
      step: "welcome";
    }
  | {
      step: "registeringUsername";
      username: string;
    }
  | {
      step: "fullyRegisteredUsername";
      username: string;
    }
  | {
      step: "error";
      error: string;
    };

type OnboardingAction =
  | {
      type: "submitUsername";
      username: string;
    }
  | {
      type: "fullyRegisteredUsername";
      username: string;
    }
  | {
      type: "error";
      error: string;
    };

const reducer = (_: OnboardingState, action: OnboardingAction) =>
  match(action)
    .returnType<OnboardingState>()
    .with({ type: "submitUsername" }, ({ username }) => ({
      step: "registeringUsername",
      username,
    }))
    .with({ type: "fullyRegisteredUsername" }, ({ username }) => ({
      step: "fullyRegisteredUsername",
      username,
    }))
    .with({ type: "error" }, ({ error }) => ({
      step: "error",
      error,
    }))
    .exhaustive();
export const OnboardingPage: React.FC = () => {
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
  const [username, setUsername] = useState("");
  const [state, dispatch] = useReducer(reducer, {
    step: "welcome",
  });
  const { email } = useAccess();
  const { mutate } = useAuth();
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (username.trim() === "") {
        return;
      }
      dispatch({
        type: "submitUsername",
        username,
      });
      fetch("/api/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }).then((res) =>
        match(res.status)
          .with(200, () => {
            mutate();
            dispatch({ type: "fullyRegisteredUsername", username });
          })
          .otherwise(() => {
            dispatch({
              type: "error",
              error: "ユーザー名の登録に失敗しました。もう一度お試しください。",
            });
          }),
      );
    },
    [username, mutate],
  );
  return (
    <div className="flex h-screen bg-[#F6F3EE] overflow-hidden text-[#595959]">
      <aside className="w-1/4 p-4">
        <header>
          <h1 className="text-4xl pl-2 shion">Shion</h1>
        </header>
        <nav className="mt-4 space-y-8">
          <AnimatePresence>
            {state.step === "fullyRegisteredUsername" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <Link
                  to="/"
                  className=" hover:text-gray-900 px-4 py-2 hover:bg-[#FDF8F5] rounded-[30px] flex items-center space-x-2"
                  aria-current="page"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>会話を始める</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </aside>
      <main className="p-4 w-full">
        <div className="bg-gray-50 flex flex-col p-4 rounded-[30px] h-full space-y-4">
          <section className="h-full overflow-y-scroll space-y-4">
            <div className="bg-white rounded-[30px] p-8 markdown">
              <article className="space-y-2">
                <p>
                  {welcomeMessage}
                  LLM実行環境のシオンです。利用にあたって、まずあなたのお名前を教えてください。本名でなくても構いません。教えてただいたお名前は、このアプリケーションでチャットの履歴を他のユーザーと共有する際に誰のチャットか識別するに使います。
                </p>
                <p>そのうち変更可能になるので、考え込む必要はありません。</p>
              </article>
            </div>
            <div className="px-12 text-sm">
              <div className="bg-indigo-50 rounded-xl px-4 py-2">
                <span className="font-bold text-indigo-400">お知らせ</span>
                <p>
                  すでに認証は完了しています。あなたのメールアドレスは
                  <span className="px-1">{email}</span>
                  ですね。教えていただいたお名前はこのメールアドレスに紐付けて覚えておくので、次回以降は入力いただきません。
                </p>
              </div>
            </div>
            {state.step === "fullyRegisteredUsername" && (
              <div className="bg-white rounded-[30px] p-8 markdown">
                <article className="space-y-2">
                  <p>
                    {state.username}{" "}
                    ですね。よろしくお願いします。左上の「会話を始める」ボタンを押してもらうとチャットを始めることができます。入力ありがとうございました！
                  </p>
                </article>
              </div>
            )}
          </section>
          <section className="mt-auto flex justify-center">
            <form className="w-2/3 space-y-1" onSubmit={handleSubmit}>
              <p className="text-sm px-6">
                英数字、ひらがな、カタカナなんでも大丈夫です。10文字くらいが視認しやすくおすすめです。
              </p>
              <div className="flex space-x-2">
                <label className="bg-white px-6 py-4 flex items-center rounded-[30px] border-[#BDBDBD] border hover:border-[#757575] focus-within:border-[#757575] transition-[height] w-full">
                  <textarea
                    className="outline-none w-full resize-none text-lg transition-all"
                    rows={1}
                    placeholder="お名前を入力してください"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={
                      username.trim().length === 0 ||
                      state.step === "registeringUsername"
                    }
                    className={clsx(
                      username.trim().length === 0 ||
                      state.step === "registeringUsername"
                        ? "text-gray-300"
                        : "",
                    )}
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
  );
};
