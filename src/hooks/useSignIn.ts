import { AuthState, useAuth } from "../contexts/auth";

export const useSignIn = (): Pick<AuthState, "isSignedIn"> => {
  const { isSignedIn } = useAuth();
  return {
    isSignedIn,
  };
};
