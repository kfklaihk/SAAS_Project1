import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  const { userId, title, transcript } = await req.json();

  // Check plan & free limits (unchanged)
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('status').eq('id', userId).single();

  const isActive = profile?.status === 'active';

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0,0,0,0);

  const { data: usage } = await supabaseAdmin
    .from('documents')
    .select('id, created_at')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString());

  if (!isActive && (usage?.length ?? 0) >= 5) {
    return NextResponse.json({ error: 'Free limit reached. Please upgrade.' }, { status: 402 });
  }

  // Build messages per DeepSeek chat-completions format
  const messages = [
    {
      role: 'system',
      content:
        'You convert meeting transcripts into structured minutes. Return JSON with: summary, decisions, risks, action_items[{owner,due_date,description}].',
    },
    { role: 'user', content: transcript },
  ];

  const resp = await fetch(
    `${process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY!}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',   // or 'deepseek-reasoner' for thinking mode
        messages,
        temperature: 0.2,
        // If you want enforced JSON, DeepSeek follows OpenAI's response_format contract:
        response_format: { type: 'json_object' },
        stream: false,
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    return NextResponse.json({ error: `DeepSeek error: ${errText}` }, { status: resp.status });
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content ?? '';

  let output;
  try { output = JSON.parse(content); } catch { output = { summary: content }; }

  const { data: doc } = await supabaseAdmin.from('documents').insert({
    user_id: userId, title, input: { transcript }, output
  }).select().single();

  return NextResponse.json({ doc });
}