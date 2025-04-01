import { Actor, HttpAgent } from "@dfinity/agent";
import { ICP_HOST } from "../../constants";
import { idlFactory, _SERVICE as CookieService } from "./service.did";

const COOKIE_CANISTER_ID = "k5j3t-jaaaa-aaaah-arcra-cai"

export const cookieActor = Actor.createActor<CookieService>(idlFactory, {
  agent: HttpAgent.createSync({
    host: ICP_HOST,
  }),
  canisterId: COOKIE_CANISTER_ID,
});