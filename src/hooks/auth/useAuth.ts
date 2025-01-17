import { useAuthState } from './useAuthState';
import { useAuthActions } from './useAuthActions';

export function useAuth() {
  const { user } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions();

  return {
    user,
    signIn,
    signUp,
    signOut
  };
}