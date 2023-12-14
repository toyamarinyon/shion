import { PropsWithChildren } from "react";
import { useSignIn } from "../hooks/useSignIn";

export const SignedIn: React.FC<PropsWithChildren> = ({ children }) => {
	const { isSignedIn } = useSignIn();
	if (isSignedIn) {
		return <>{children}</>;
	} else {
		return null;
	}
};

export const SignedOut: React.FC<PropsWithChildren> = ({ children }) => {
	const { isSignedIn } = useSignIn();
	if (!isSignedIn) {
		return <>{children}</>;
	} else {
		return null;
	}
};
