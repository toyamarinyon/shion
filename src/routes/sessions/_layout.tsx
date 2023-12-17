import { PlusIcon } from "@heroicons/react/24/solid";
import { createId } from "@paralleldrive/cuid2";
import { AnimatePresence, motion } from "framer-motion";
import { PropsWithChildren, useMemo } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { array, parse } from "valibot";
import { selectSessionSchema } from "../../../db/schema";
import { SessionListItem } from "../../components/SessionListItem";
import { SessionContext } from "../../contexts/session";

const useResolvedSession = () => {
  const { sessionId: sessionIdInParam } = useParams<{ sessionId: string }>();
  const { sessionId, isNew } = useMemo(() => {
    return {
      sessionId: sessionIdInParam ?? createId(),
      isNew: sessionIdInParam == null,
    };
  }, [sessionIdInParam]);
  return { sessionId, isNew };
};

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const { sessionId, isNew } = useResolvedSession();
  const loaderData = useLoaderData();
  const sessions = useMemo(
    () => parse(array(selectSessionSchema), loaderData),
    [loaderData],
  );

  return (
    <SessionContext.Provider value={{ id: sessionId, isNew }}>
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
              <span>会話を始める</span>
            </Link>
            <section className="space-y-2">
              <AnimatePresence initial={false}>
                {sessions.length > 0 && (
                  <motion.h2
                    className="text-sm pl-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    あなたの会話
                  </motion.h2>
                )}
              </AnimatePresence>
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {sessions.map(({ id, title }) => (
                    <SessionListItem key={id} id={id} title={title} />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          </nav>
        </aside>
        <main className="p-4 w-full">{children}</main>
      </div>
    </SessionContext.Provider>
  );
};
