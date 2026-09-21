import crypto from "node:crypto";
const API="https://open.tiktokapis.com";
async function call(path,{method="GET",accessToken,body}={}){
  const r=await fetch(API+path,{method,headers:{...(accessToken?{Authorization:"Bearer "+accessToken}:{}),...(body?{"Content-Type":"application/json; charset=UTF-8"}:{})},body:body?JSON.stringify(body):undefined});
  const data=await r.json(); if(!r.ok||data?.error?.code) throw new Error(data?.error?.message||data?.error_description||data?.error||("TikTok API "+r.status)); return data;
}
export function makeState(){return crypto.randomBytes(24).toString("hex")}
export function authUrl({clientKey,redirectUri,scopes,state}){const q=new URLSearchParams({client_key:clientKey,response_type:"code",scope:scopes,redirect_uri:redirectUri,state});return "https://www.tiktok.com/v2/auth/authorize/?"+q}
export async function exchangeCode({clientKey,clientSecret,code,redirectUri}){const body=new URLSearchParams({client_key:clientKey,client_secret:clientSecret,code,grant_type:"authorization_code",redirect_uri:redirectUri});const r=await fetch(API+"/v2/oauth/token/",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});const data=await r.json();if(!r.ok)throw new Error(data?.error_description||data?.error||"OAuth token exchange failed");return data}
export async function creatorInfo(accessToken){return (await call("/v2/post/publish/creator_info/query/",{method:"POST",accessToken})).data}
export async function initDirectPost(accessToken,payload){return (await call("/v2/post/publish/video/init/",{method:"POST",accessToken,body:payload})).data}
export async function publishStatus(accessToken,publishId){return (await call("/v2/post/publish/status/fetch/",{method:"POST",accessToken,body:{publish_id:publishId}})).data}
