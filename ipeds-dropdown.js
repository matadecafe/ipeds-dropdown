(() => {
  // ---- tweak this to match your field label or hardcode a selector ----
  const LABEL_REGEX = /Institutions/i; // change to the exact label text on your form if needed
  const DATA_URL = "https://api.lightcast.io/ipeds/health/status"; // replace with your real institutions endpoint

  function waitForSelect(labelRegex, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      const start = performance.now();
      (function probe() {
        const labels = Array.from(document.querySelectorAll("label"));
        const label = labels.find(l => labelRegex.test(l.textContent.trim()));
        const sel = label ? document.getElementById(label.getAttribute("for"))
                          : document.querySelector("select");
        if (sel) return resolve(sel);
        if (performance.now() - start > timeoutMs) return reject(new Error("Dropdown not found"));
        setTimeout(probe, 200);
      })();
    });
  }

  async function fetchInstitutions() {
    const res = await fetch(DATA_URL, {
      headers: { "Accept": "application/json" }
      // If you need a bearer token:
      // headers: { "Accept": "application/json", "Authorization": "Bearer YOUR_TOKEN" }
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    const list = data.institutions || data.items || data.results || data || [];
    return list.map(x => ({
      id: x.id || x.unitid || x.code || x.name,
      name: (x.name || x.title || x.institution || x.school || "").toString().trim()
    })).filter(r => r.name);
  }

  async function init() {
    const select = await waitForSelect(LABEL_REGEX);
    const rows = await fetchInstitutions();

    // reset + placeholder
    select.innerHTML = "";
    select.add(new Option("Select an institution…", ""));

    // unique options
    const seen = new Set();
    for (const r of rows) {
      if (seen.has(r.name)) continue;
      seen.add(r.name);
      select.add(new Option(r.name, r.id || r.name));
    }
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
