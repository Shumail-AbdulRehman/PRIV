import {client} from "../../api/client.js"
import type{ LoginForm } from "./types.js";
import type{ AuthUser } from "./types.js";

export const login = async (data: LoginForm): Promise<AuthUser> => {
  const { role, ...payload } = data;
  const url = role === 'Manager' ? '/manager/manager-login' : '/staff/staff-login';
  const res = await client.post(url, payload, { withCredentials: true });
  return res.data.data;
};
