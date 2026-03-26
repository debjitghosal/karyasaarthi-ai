import os

from google import genai


def get_genai_client():
    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

    if not project:
        return None

    try:
        client = genai.Client(
            vertexai=True,
            project=project,
            location=location,
        )
        return client
    except Exception:
        return None


def generate_text(prompt: str) -> str:
    client = get_genai_client()
    if client is None:
        return ""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = getattr(response, "text", None)
        return text.strip() if text else ""
    except Exception as e:
        print("Gemini error:", e)
        return ""