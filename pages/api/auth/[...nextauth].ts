import NextAuth, { Account, TokenSet, User } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";
import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import { Session } from "next-auth";

const scopes = ["user-read-playback-state", "user-modify-playback-state"].join(
  ","
);

const params = {
  scopes: scopes,
};

const LOGIN_URL =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams(params).toString();

const refreshAccessToken = async (token: JWT) => {
  debugger
  const url = "https://accounts.spotify.com/api/token";
  const params = {
    grant_type: "refresh_token",
    refresh_token: token.refreshToken as string,
  };
  const options = {
    method: "POST",
    body: new URLSearchParams(params).toString(),
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    },
  };
  try {
    debugger
    const response: AxiosResponse = await axios.post(url, options);
    const data = await response.data;
    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    } as JWT;
  } catch (error) {
    const isAxiosError = (error: any): error is AxiosError => {
      return error.isAxiosError;
    };
    if (isAxiosError(error)) {
      console.log(error.response?.data);
      console.log(error.response?.status);
      console.log(error.response?.headers);
      throw new Error(error.message);
    }
    console.log(error);
  }
  return token;
};

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresIn = account.expires_at;
        return token;
      }
      // Return previous token if the access token has not expired yet
      if (token.expiresIn && Date.now() < token.expiresIn * 1000) {
        return token;
      }
      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User;
    }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
export default NextAuth(authOptions);
