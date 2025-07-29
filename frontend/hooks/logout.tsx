"use server"
import { cookies } from 'next/headers';

export async function deleteCookies(name:string){
    (await cookies()).delete(name)
  }

export async function hasCookies(name:string){
    const cookieStore = await cookies();
    return cookieStore.has(name);
  }
