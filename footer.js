(function () {
  const thisScript = document.currentScript;
  const root = thisScript.getAttribute("src").replace("footer.js", "");

  const showBackToTop = thisScript.dataset.backToTop !== "false";

  const socials = [
    { name: "x", alt: "X (or Twitter)" },
    { name: "instagram", alt: "instagram" },
    { name: "tiktok", alt: "tiktok" },
    { name: "youtube", alt: "youtube" },
    { name: "github", alt: "github" },
    { name: "steam", alt: "steam" },
  ];

  const socialsHTML = socials
    .map(
      (s) => `
        <li>
          <a href=""><img src="https://raw.githubusercontent.com/LeechLab/LeechLab-WebApp-Logos-Images/refs/heads/main/Socails/${s.name}.svg" alt="${s.alt}" /></a>
        </li>`,
    )
    .join("");

  const footerHTML = `
    <footer>
      <div id="footerButtonGrid">
        <ul id="socials">${socialsHTML}</ul>
        <ul id="other">
          <li><a href="">Language: US-EN</a></li>
          ${showBackToTop ? '<li><a href="#header">Back to top ↑</a></li>' : ""}
        </ul>
      </div>
      <ul id="support">
        <li><a href="">HELP & TECH SUPPORT</a></li>
        <li><a href="">PRIVACY & COOKIES POLICY</a></li>
        <li><a href="">USER AGREEMENT</a></li>
        <li><a href="">ABOUT US</a></li>
        <p style="padding: 10px">&copy; 2026 LeechLab LLC</p>
      </ul>
    </footer>`;

  const target = document.getElementById("footer-placeholder");
  if (target) target.outerHTML = footerHTML;
})();
