import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");

  let query = supabase.from("en_words").select("word");

  if (level) {
    query = query.eq("level", level);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const words = data.map((item) => item.word);

  // Fisher-Yates (Knuth) シャッフルアルゴリズム
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]]; // 要素を交換
  }

  // シャッフルされた配列から最初の10個のユニークな単語を取得
  const randomWords: Array<string> = words.slice(0, 10);

  return NextResponse.json({ words: randomWords });
}
