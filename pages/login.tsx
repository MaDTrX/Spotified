
import { NextPage } from "next";
import { signIn } from "next-auth/react";

const Login: NextPage= () => {
  return (
    <div className="flex items-center justify-center">
      <button onClick={() => signIn("spotify", { callbackUrl: "/" })}>
        Log In With Spotify
      </button>
    </div>
  );
};

export default Login;
