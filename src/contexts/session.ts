import { createContext, useContext } from "react";
import { invariant } from "./invariant";

type SessionState = {
  id: string;
  isNew: boolean;
};

export const SessionContext = createContext<SessionState | undefined>(
  undefined,
);

export const useSession = () => {
  const context = useContext(SessionContext);
  invariant(context, "useSession must be used within a SessionProvider");
  return context as SessionState;
};
