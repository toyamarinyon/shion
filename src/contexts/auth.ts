import { createContext, useContext } from "react";
import { invariant } from "./invariant";

export type AuthState = { isSignedIn: boolean };

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	invariant(
		context,
		"You must render a <AuthSessionProvider> higher in the tree",
	);
	return context as AuthState;
};
