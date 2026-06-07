const params = new URLSearchParams(window.location.search);
const targetId = params.get("target_id") || "";
const label = params.get("label") || "useful";
const symbol = params.get("symbol") || "unknown symbol";
const verdict = params.get("verdict") || "unknown verdict";
const cardId = params.get("card_id") || "";

const $ = (id) => document.getElementById(id);
const root = document.documentElement;

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  localStorage.setItem("cockpit-theme", nextTheme);
  $("theme-toggle").textContent = nextTheme === "dark" ? "Light" : "Dark";
  $("theme-toggle").title = `Switch to ${nextTheme === "dark" ? "light" : "dark"} mode`;
}

applyTheme(localStorage.getItem("cockpit-theme") || "light");
$("theme-toggle").addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

$("label").value = label;
$("summary").textContent = targetId
  ? `${symbol}: ${verdict.replaceAll("_", " ")} · target ${targetId}${cardId ? ` · card ${cardId}` : ""}`
  : "Missing target_id. Open this page from a cockpit recommendation email or card.";

$("feedback-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("submit").disabled = true;
  $("result").textContent = "Submitting...";
  try {
    if (!targetId) {
      throw new Error("Missing target_id.");
    }
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_id: targetId,
        label: $("label").value,
        note: $("note").value.trim() || undefined,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || response.statusText);
    }
    $("result").textContent = `Feedback recorded.\n\n${JSON.stringify(payload, null, 2)}`;
  } catch (error) {
    $("result").textContent = error instanceof Error ? error.message : String(error);
    $("submit").disabled = false;
  }
});
