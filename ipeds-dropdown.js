(() => {
  const FIELD_ID = "id123-control119147262"; // 123FormBuilder auto-id
  const API_URL = "https://api.lightcast.io/ipeds/institutions/all";
  const LIMIT = 1000;

  async function fetchAllInstitutions(token) {
    let results = [];
    let offset = 0;

    while (true) {
      const resp = await fetch(`${API_URL}/${offset}/${LIMIT}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // ⚠️ replace or proxy
        }
      });
      if (!resp.ok) throw new Error(`Lightcast error ${resp.status}`);
      const page = await resp.json();

      if (!Array.isArray(page) || page.length === 0) break;
      results.push(...page);
      if (page.length < LIMIT) break;

      offset += LIMIT;
    }

    return results.map(inst => ({
      id: inst.unitid || inst.id || inst.name,
      name: inst.name || inst.title || inst.institution
    })).filter(r => r.name);
  }

  async function init() {
    const select = document.getElementById(FIELD_ID);
    if (!select) return console.warn("Dropdown not found:", FIELD_ID);

    // Loading placeholder
    select.innerHTML = "";
    select.add(new Option("Loading institutions…", ""));

    try {
      // ⚠️ For now, paste token here (unsafe) OR proxy it with Apps Script
      const rows = await fetchAllInstitutions("YOUR_ACCESS_TOKEN_HERE");

      select.innerHTML = "";
      select.add(new Option("Select an institution…", ""));
      const seen = new Set();
      rows.forEach(r => {
        if (seen.has(r.name)) return;
        seen.add(r.name);
        select.add(new Option(r.name, r.id));
      });
    } catch (err) {
      console.error("Failed to load institutions:", err);
      select.innerHTML = "";
      select.add(new Option("Failed to load institutions", ""));
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
