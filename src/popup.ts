const toggle = document.getElementById('toggle') as HTMLInputElement;

chrome.storage.sync.get('enabled', data => {
  toggle.checked = data.enabled !== false;
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
});

document.addEventListener("DOMContentLoaded", () => {
  const aboutLink = document.getElementById("aboutLink") as HTMLAnchorElement | null;
  const infoPopup = document.getElementById("infoPopup") as HTMLElement | null;
  const extVersion = document.getElementById("extVersion") as HTMLElement | null;

  if (!aboutLink || !infoPopup || !extVersion) return;

  aboutLink.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();
    infoPopup.style.display = infoPopup.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e: MouseEvent) => {
    if (
      infoPopup.style.display === "block" &&
      !infoPopup.contains(e.target as Node) &&
      e.target !== aboutLink
    ) {
      infoPopup.style.display = "none";
    }
  });

  const manifest = chrome.runtime.getManifest();
  extVersion.textContent = manifest.version;
});