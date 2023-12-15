import { AuthState, useAuth } from "../contexts/auth";

export const useSignIn = (): AuthState => {
  const { isSignedIn } = useAuth();
  return {
    isSignedIn,
  };
};
