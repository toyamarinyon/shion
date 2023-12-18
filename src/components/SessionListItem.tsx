import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSession } from "../contexts/session";

type SessionListItemProps = {
  id: string;
  title: string;
};
export const SessionListItem: React.FC<SessionListItemProps> = ({
  id,
  title,
}) => {
  const { id: sessionId } = useSession();
  return (
    <motion.li
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
    >
      <Link
        to={`/sessions/${id}`}
        className={clsx(
          " pl-4 pr-6 py-2 rounded-[30px] flex items-center space-x-3 text-sm",
          id === sessionId && "bg-[#fbe6d2]",
          id !== sessionId && "hover:bg-[#FDF8F5]",
          title === "" && "animate-pulse",
        )}
      >
        <div
          className={clsx(
            " rounded-lg p-1",
            id === sessionId && "bg-[#F6F3EE]",
            id !== sessionId && "bg-[#FDF8F5]",
          )}
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 shrink-0" />
        </div>
        {title === "" ? (
          <span />
        ) : (
          <span className="truncate text-ellipsis">{title}</span>
        )}
      </Link>
    </motion.li>
  );
};
