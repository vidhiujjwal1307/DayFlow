import json
import os
import re
from typing import Optional

from fastapi import APIRouter, HTTPException

from ..schemas import AIPlanRequest, AIPlanResponse, AIScheduleItem

router = APIRouter(prefix="/api/ai", tags=["AI Planner"])

TIME_PATTERN = re.compile(
    r"(?<!\d)(?P<hour>\d{1,2})(?:[:.](?P<minute>\d{2}))?\s*(?P<period>a\.?m\.?|p\.?m\.?)?",
    re.IGNORECASE,
)


def _to_minutes(match: re.Match, inferred_period: Optional[str] = None) -> Optional[int]:
    hour = int(match.group("hour"))
    minute = int(match.group("minute") or 0)
    period = (match.group("period") or inferred_period or "").lower().replace(".", "")
    if minute > 59:
        return None

    if period:
        if hour < 1 or hour > 12:
            return None
        hour %= 12
        if period == "pm":
            hour += 12
    elif hour > 23:
        return None

    return hour * 60 + minute


def _parse_time_ranges(value: Optional[str]) -> list[tuple[int, int]]:
    matches = list(TIME_PATTERN.finditer(value or ""))
    ranges = []
    for index in range(0, len(matches) - 1, 2):
        start_match, end_match = matches[index:index + 2]
        start_period = (start_match.group("period") or "").lower().replace(".", "")
        end_period = (end_match.group("period") or "").lower().replace(".", "")
        first_hour = int(start_match.group("hour"))
        second_hour = int(end_match.group("hour"))
        first_clock_hour = first_hour % 12 if first_hour <= 12 else first_hour
        second_clock_hour = second_hour % 12 if second_hour <= 12 else second_hour

        if not start_period and end_period and first_hour <= 12:
            start_period = end_period if first_clock_hour <= second_clock_hour else ("am" if end_period == "pm" else "pm")
        if start_period and not end_period and int(end_match.group("hour")) <= 12:
            end_period = start_period if second_clock_hour >= first_clock_hour else ("pm" if start_period == "am" else "am")

        start = _to_minutes(start_match, start_period or None)
        end = _to_minutes(end_match, end_period or None)
        if start is not None and end is not None and start < end:
            ranges.append((start, end))
    return ranges


def _parse_clock(value: Optional[str]) -> Optional[int]:
    matches = list(TIME_PATTERN.finditer(value or ""))
    if len(matches) != 1:
        return None
    return _to_minutes(matches[0])


def _free_intervals(start: int, end: int, commitments: list[tuple[int, int]]) -> list[tuple[int, int]]:
    clipped = sorted(
        (max(start, item_start), min(end, item_end))
        for item_start, item_end in commitments
        if item_start < end and item_end > start
    )
    merged = []
    for item_start, item_end in clipped:
        if merged and item_start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], item_end))
        else:
            merged.append((item_start, item_end))

    free = []
    cursor = start
    for item_start, item_end in merged:
        if cursor < item_start:
            free.append((cursor, item_start))
        cursor = max(cursor, item_end)
    if cursor < end:
        free.append((cursor, end))
    return free


def _time_string(minutes: int) -> str:
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def _schedule_fallback(plan_req: AIPlanRequest, available: tuple[int, int], free: list[tuple[int, int]]) -> AIPlanResponse:
    task_names = plan_req.important_tasks
    preferred_durations = [45 if index % 2 == 0 else 60 for index in range(len(task_names))]

    # First preserve the normal focus-session lengths, breaks, and a short walk.
    # If the window is tight, remove optional breaks and then shorten sessions.
    for reduction in range(0, 61, 5):
        durations = [max(15, duration - reduction) for duration in preferred_durations]
        for add_breaks, add_walk in ((True, True), (True, False), (False, True), (False, False)):
            events = []
            for index, duration in enumerate(durations):
                events.append(("task", index, duration))
                if add_breaks and index < len(task_names) - 1:
                    events.append(("break", None, 15))
            if add_walk:
                if add_breaks:
                    events.append(("break", None, 15))
                events.append(("walk", None, 30))

            cursors = [slot_start for slot_start, _ in free]
            placements = []
            slot_index = 0
            for kind, task_index, duration in events:
                while slot_index < len(free) and cursors[slot_index] + duration > free[slot_index][1]:
                    slot_index += 1
                if slot_index >= len(free):
                    break
                event_start = cursors[slot_index]
                cursors[slot_index] += duration
                placements.append((kind, task_index, event_start, cursors[slot_index], duration))

            if len(placements) != len(events):
                continue

            suggested = []
            for kind, task_index, event_start, event_end, duration in placements:
                if kind == "task":
                    title = task_names[task_index].strip()
                    category = "Project" if task_index == 0 else (
                        "Study" if "study" in title.lower() or "read" in title.lower() else "Personal"
                    )
                    priority = "High" if task_index == 0 else "Medium"
                    description = "Focused session with calm pacing and a clear goal."
                elif kind == "walk":
                    title = "Mindful Break & Walk"
                    category = "Health"
                    priority = "Low"
                    description = "Step away, stretch, and give your mind time to recharge."
                else:
                    continue

                suggested.append(AIScheduleItem(
                    title=title,
                    start_time=_time_string(event_start),
                    end_time=_time_string(event_end),
                    category=category,
                    priority=priority,
                    description=description,
                    estimated_duration=duration,
                ))

            return AIPlanResponse(
                summary=(
                    f"Here is a balanced schedule between {_time_string(available[0])} and "
                    f"{_time_string(available[1])}, with focused sessions and room for breaks."
                ),
                suggested_tasks=suggested,
            )

    raise HTTPException(
        status_code=400,
        detail="There isn’t enough free time in that window for these tasks. Widen your available hours or shorten your fixed commitments.",
    )


def _valid_generated_plan(data: dict, available: tuple[int, int], commitments: list[tuple[int, int]]) -> bool:
    items = data.get("suggested_tasks")
    if not isinstance(items, list) or not items:
        return False

    scheduled = []
    for item in items:
        start = _parse_clock(item.get("start_time"))
        end = _parse_clock(item.get("end_time"))
        if start is None or end is None:
            return False
        if start < available[0] or end > available[1] or start >= end:
            return False
        if any(start < fixed_end and end > fixed_start for fixed_start, fixed_end in commitments):
            return False
        if any(start < other_end and end > other_start for other_start, other_end in scheduled):
            return False
        scheduled.append((start, end))
    return True


@router.post("/plan", response_model=AIPlanResponse)
def generate_day_plan(plan_req: AIPlanRequest):
    """Generate a schedule contained within the user's available hours."""
    available_ranges = _parse_time_ranges(plan_req.available_hours)
    if not available_ranges:
        raise HTTPException(
            status_code=400,
            detail="Enter available hours as a start and end time, such as 15:30 - 18:00.",
        )

    available = available_ranges[0]
    commitments = _parse_time_ranges(plan_req.fixed_commitments)
    free = _free_intervals(*available, commitments)
    if not free:
        raise HTTPException(status_code=400, detail="Your fixed commitments fill the entire available window.")

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            prompt = f"""
You are DayFlow's mindful daily planning assistant. Create a realistic schedule for {plan_req.date}.
Schedule only between {plan_req.available_hours}. Do not schedule anything before the start time or after the end time.
Fixed commitments that must remain completely clear: {plan_req.fixed_commitments}
Priorities: {plan_req.priorities}
Estimated task durations: {plan_req.estimated_durations}
User's tasks to schedule: {", ".join(plan_req.important_tasks)}

Return valid JSON with format:
{{
  "summary": "Short encouraging overview of the schedule",
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
Use 24-hour times. Keep tasks within the available window, avoid all fixed commitments and overlaps, and include realistic breaks when time permits.
Only output the JSON object.
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
            data = json.loads(response.text)
            if _valid_generated_plan(data, available, commitments):
                return AIPlanResponse(**data)
        except Exception:
            # Fall back to the local planner if Gemini is unavailable or returns
            # a schedule that ignores the requested time window.
            pass

    return _schedule_fallback(plan_req, available, free)
