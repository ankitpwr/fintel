import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Button } from "./ui/button";
import useUserStore from "@/store/useUserStore";
import { SpinnerIcon } from "@phosphor-icons/react";

export function GoogleLogin() {
  const { signup, signin, isSigningUp, isSigningIn } = useUserStore();

  const responseSignup = async (authResult: any) => {
    try {
      if (authResult.code) {
        signup(authResult.code);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const responseSignin = async (authResult: any) => {
    try {
      if (authResult.code) {
        signin(authResult.code);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const signupInit = useGoogleLogin({
    onSuccess: responseSignup,
    onError: responseSignup,
    flow: "auth-code",
  });

  const signinInit = useGoogleLogin({
    onSuccess: responseSignin,
    onError: responseSignin,
    flow: "auth-code",
  });
  return (
    <div className="flex justify-center items-center gap-4 font-googleSans ">
      <Button
        onClick={() => signupInit()}
        disabled={isSigningUp || isSigningIn}
        aria-label={isSigningUp ? "Signing up" : "Sign up with Google"}
        aria-busy={isSigningUp}
        variant="secondary"
        className={"px-4 text-base rounded"}
      >
        {isSigningUp ? <SpinnerIcon className="animate-spin" /> : "Signup"}
      </Button>
      <Button
        className="bg-emerald-400 text-base text-black hover:bg-emerald-500 px-4 rounded"
        onClick={() => signinInit()}
        disabled={isSigningUp || isSigningIn}
        aria-label={isSigningIn ? "Signing in" : "Sign in with Google"}
        aria-busy={isSigningIn}
        variant={"default"}
      >
        {isSigningIn ? <SpinnerIcon className="animate-spin" /> : "Signin"}
      </Button>
    </div>
  );
}

export function GoogleAuthWrapper() {
  const id = import.meta.env.VITE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={`${id}`}>
      <GoogleLogin />
    </GoogleOAuthProvider>
  );
}
