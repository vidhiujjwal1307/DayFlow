import os
import json
from fastapi import APIRouter, HTTPException
from ..schemas import AIPlanRequest, AIPlanResponse, AIScheduleItem

router = APIRouter(prefix="/api/ai", tags=["AI Planner"])

@router.post("/plan", response_model=AIPlanResponse)
def generate_day_plan(plan_req: AIPlanRequest):
    """
    Generate a suggested daily schedule using Gemini if GEMINI_API_KEY is present,
    or a mindful heuristic schedule generator if not configured.
    Always returns structured JSON without overwriting existing tasks.
    """
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = f"""
You are DayFlow's mindful daily planning assistant. Help create a calm, structured, realistic daily schedule for {plan_req.date}.
Available hours: {plan_req.available_hours}
Fixed commitments: {plan_req.fixed_commitments}
Priorities: {plan_req.priorities}
Estimated task durations: {plan_req.estimated_durations}
User's tasks to schedule: {", ".join(plan_req.important_tasks)}

Return valid JSON with format:
{{
  "summary": "Short encouraging 1-2 sentence overview of the day's flow",
  "suggested_tasks": [
    {{
      "title": "Task name",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "category": "Study" | "College" | "Project" | "Personal" | "Health" | "Other",
      "priority": "High" | "Medium" | "Low",
      "description": "Short gentle tip or focus area",
      "estimated_duration": 45
    }}
  ]
}}
Make sure start_time and end_time are 24h format (HH:MM), start_time < end_time, and they do not conflict with each other or fixed commitments. Keep realistic breaks.
Only output the JSON object.
"""
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            return AIPlanResponse(**data)
        except Exception as e:
            # Fallback gracefully to smart heuristic if LLM call fails
            pass

    # Mindful Heuristic schedule generation (Works seamlessly without API key)
    start_hour = 9
    suggested = []
    current_time_min = start_hour * 60

    # Parse fixed lunch break or start window if simple
    for idx, task_name in enumerate(plan_req.important_tasks):
        duration = 45 if idx % 2 == 0 else 60
        s_h = current_time_min // 60
        s_m = current_time_min % 60
        end_time_min = current_time_min + duration
        e_h = end_time_min // 60
        e_m = end_time_min % 60

        category = "Project" if idx == 0 else ("Study" if "study" in task_name.lower() or "read" in task_name.lower() else "Personal")
        priority = "High" if idx == 0 else "Medium"

        suggested.append(AIScheduleItem(
            title=task_name.strip(),
            start_time=f"{s_h:02d}:{s_m:02d}",
            end_time=f"{e_h:02d}:{e_m:02d}",
            category=category,
            priority=priority,
            description="Focused session with calm pacing and clear goal.",
            estimated_duration=duration
        ))

        # Add 15-min breath & hydration break
        current_time_min = end_time_min + 15

    # Always include a mindful walk or break
    s_h = current_time_min // 60
    s_m = current_time_min % 60
    end_break = current_time_min + 30
    e_h = end_break // 60
    e_m = end_break % 60
    suggested.append(AIScheduleItem(
        title="Mindful Afternoon Walk & Tea",
        start_time=f"{s_h:02d}:{s_m:02d}",
        end_time=f"{e_h:02d}:{e_m:02d}",
        category="Health",
        priority="Low",
        description="Step outside, stretch, and let your mind recharge.",
        estimated_duration=30
    ))

    return AIPlanResponse(
        summary="Here is a balanced, gentle schedule crafted with focused work sessions and restorative pauses.",
        suggested_tasks=suggested
    )
