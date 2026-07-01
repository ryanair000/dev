import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/utils";
export function GET(){return NextResponse.json({ok:true,app:"stepone-autodealers",supabaseConfigured:isSupabaseConfigured(),timestamp:new Date().toISOString()});}
