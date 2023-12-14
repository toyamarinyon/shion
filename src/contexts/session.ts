import { createContext, useContext } from "react";

type SessionState = {
	id: string;
};

export const SessionContext = createContext<SessionState | undefined>(
	undefined,
);

const invariant = (value: unknown, message?: string) => {
	if (value === false || value === null || typeof value === "undefined") {
		throw new Error(message);
	}
};

export const useSession = () => {
	const context = useContext(SessionContext);
	invariant(context, "useSession must be used within a SessionProvider");
	return context as SessionState;
};
