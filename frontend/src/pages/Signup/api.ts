
import {client} from "../../api/client.js"
import type{ SignUpForm, AuthUser } from "./types.js";


export const signUp = async (data: SignUpForm): Promise<AuthUser> => {
  const res = await client.post('/manager/manager-signup', data, { withCredentials: true });
  return res.data.data;
};
