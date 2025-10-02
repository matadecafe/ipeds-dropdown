(() => {
  const LABEL_REGEX = /Institutions/i; // Change if your dropdown label differs

  // 👉 Correct Lightcast institutions endpoint (paginated)
  const API_URL = "https://api.lightcast.io/ipeds/institutions/all";
  const LIMIT = 1000; // adjust if needed

  async function fetchAllInstitutions(token) {
    let results = [];
    let offset = 0;

    while (true) {
      const resp = await fetch(`${API_URL}/${offset}/${LIMIT}`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // put your token here, or proxy it
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
    // Find your dropdown
    const label = Array.from(document.querySelectorAll("label"))
      .find(l => LABEL_REGEX.test(l.textContent.trim()));
    const select = label ? document.getElementById(label.getAttribute("for")) : null;

    if (!select) return console.warn("Dropdown not found!");

    // Temporary placeholder
    select.innerHTML = "";
    select.add(new Option("Loading institutions…", ""));

    try {
      // ⚠️ Replace with a real token or proxy
      const rows = await fetchAllInstitutions("YOUR_ACCESS_TOKEN_HERE");

      select.innerHTML = "";
      select.add(new Option("Select an institution…", ""));
      const seen = new Set();
      rows.forEach(r => {
        if (seen.has(r.name)) return;
        seen.add(r.name);
        select.add(new Option(r.name, r.id));
      });
    } catch (e) {
      console.error("Error loading institutions:", e);
      select.innerHTML = "";
      select.add(new Option("Failed to load institutions", ""));
    }
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
