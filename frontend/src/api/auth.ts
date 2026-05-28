import { client } from './client';


export const refreshToken = async () => {
  
  const res= await client.post("/common/refresh-token");
  return res.data;

};

export const logoutApi = async () => {
  
  const res=await client.post("/common/logout", {}, { withCredentials: true });
  return res.data;
};

export const getCurrentUser=async ()=>
{
  const res=await client.get("/common/get-current-user");
  return res;
}