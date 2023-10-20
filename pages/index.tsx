import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

const Home: NextPage = () => {
  const [token, setToken] = useState<string>("");
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setToken(session.accessToken as string);
    }
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      User Sesiion: {token}
    </main>
  );
};

export default Home;
