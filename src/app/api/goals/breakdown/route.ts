import { NextRequest, NextResponse } from "next/server";
import { generateGoalBreakdown } from "@/lib/groq/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";

    if (!goal) {
      return NextResponse.json({ error: "Goal text is required" }, { status: 400 });
    }

    const plan = await generateGoalBreakdown(goal);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Goal breakdown failed:", error);
    return NextResponse.json(
      { error: "Unable to build a goal plan right now" },
      { status: 500 }
    );
  }
}
