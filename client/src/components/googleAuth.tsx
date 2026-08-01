import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import useUserStore from "@/store/useUserStore";

export function GoogleLogin() {
  const navigate = useNavigate();
  const { signup, signin } = useUserStore();

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
        variant="secondary"
        className={"px-4 text-base rounded"}
      >
        Signup
      </Button>
      <Button
        className="bg-emerald-400 text-base text-black hover:bg-emerald-500 px-4 rounded"
        onClick={() => signinInit()}
        variant={"default"}
      >
        Signin
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
