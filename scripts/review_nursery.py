import requests
import json
import os

API_KEY = os.getenv("XAI_API_KEY", "your-api-key-here")
MODEL = "grok-2-1212" # Using the specific latest Grok version

BASE_DIR = "/Users/user/.gemini/antigravity/scratch/onlinestore"

def get_file_content(rel_path):
    path = os.path.join(BASE_DIR, rel_path)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    return f"File {path} not found"

def run_review():
    files_to_review = [
        "app/nursery/page.tsx",
        "app/nursery/layout.tsx",
        "app/nursery/components/PlantCard.tsx",
        "app/nursery/components/NurseryCategoryFilter.tsx"
    ]
    
    code_context = ""
    for file_path in files_to_review:
        content = get_file_content(file_path)
        code_context += f"\n## 📄 FILE: {file_path}\n```tsx\n{content}\n```\n"

    system_prompt = """
You are Maya, a Senior Full-Stack Architect and UX Specialist. 
You are performing a strict Code Review on a new "Nursery Shop" module built with Next.js 15/16 (App Router), TailwindCSS, and Framer Motion.

The project aims for a "Premium, Organic, Chalkboard" aesthetic (Amatic SC font, nice textures) with a focus on high performance and smooth UX.

YOUR MISSION:
1. **Analyze Architecture**: Review the split between Server Components (layout) and Client Components (page). Is the metadata handling correct?
2. **Evaluate UX/UI Logic**: Check the filtering logic (robustness of Hebrew category matching), the responsiveness of the grid, and the 'Amatic SC' typography implementation.
3. **Inspect Code Quality**: Look for DRY violations, potential performance bottlenecks (useEffect/useMemo usage), and TypeScript types.
4. **Safety & Robustness**: Check for null-safety in the category lookup and map functions.

Give a final score (0-100) and actionable feedback.
Answer in Hebrew (Professional tone).
"""

    prompt = f"""
# 🌿 NURSERY SHOP MODULE REVIEW

Here is the source code for the requested files:
{code_context}

---

## 🎯 REVIEW REQUEST
Please review the code based on the system prompt. Focus on:
- The robustness of the category check (`trim`, `name_he` vs `name`).
- The UI consistency (font usage).
- The Metadata implementation in `layout.tsx`.

Provide your grade and detailed feedback.
"""

    print(f"🚀 שולח סקירה לגרוק ({MODEL})...")
    
    try:
        response = requests.post(
            "https://api.x.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2
            }
        )
        response.raise_for_status()
        result = response.json()
        
        reply = result['choices'][0]['message'].get('content', 'No content returned')
        
        print("\n" + "━" * 60)
        print("🌸 MAYA'S NURSERY CODE REVIEW")
        print("━" * 60 + "\n")
        print(reply)
        print("\n" + "━" * 60)
        
        # Save locally
        with open(os.path.join(BASE_DIR, "GROK_NURSERY_REVIEW.md"), "w", encoding="utf-8") as f:
            f.write(f"# Grok Nursery Review\n\n{reply}")
            
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Details: {e.response.text}")

if __name__ == "__main__":
    run_review()
