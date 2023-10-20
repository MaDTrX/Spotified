import { Account} from "next-auth"

declare module "next-auth" {
    interface Session {
        accessToken?: Account["accessToken"]
    }
}


declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: Account["access_token"]
        expiresIn?: Account["expires_at"]
    }
}