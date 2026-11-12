// All page content lives here. Edit this file to update the site; os.js only renders it.
window.CHASE = {
  name: "Chase Tseng",
  role: "Infrastructure and automation engineer",
  place: "Hsinchu, Taiwan",
  bio: "I run IT systems (Active Directory, firewalls, networks, endpoints) and write the Python that automates them. Now moving that work onto Google Cloud and LLM tooling.",
  links: [
    { label: "Email", href: "mailto:chase5ws@gmail.com", text: "chase5ws@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/chase5ws/", text: "linkedin.com/in/chase5ws" },
    { label: "GitHub", href: "https://github.com/chase5ws?tab=repositories", text: "github.com/chase5ws" },
  ],

  // status: live | source | private | building
  // Live projects (a demo to open) go in the Live folder; the rest in Projects. Private repos get no source link.
  projects: [
    {
      id: "asc-bot", image: "./os/icons/asc-bot.png", icon: "bot", name: "ASC Bot", status: "live", where: "Railway, source private",
      summary: "A Discord bot that communities license per server, run from a web admin.",
      points: [
        "Each system is a folder: drop it in, restart, enable it per server.",
        "Excel files are the database by design; servers share or keep their own data.",
        "A web admin, signed in with Discord, runs every server.",
      ],
      stack: "Node.js, discord.js, ExcelJS, Railway",
      live: "https://2026ascdiscordbot-production.up.railway.app",
      liveLabel: "Admin console demo",
    },
    {
      id: "asc-site", image: "./os/icons/asc-site.png", icon: "coin", name: "ASC community website", status: "live", where: "GitHub Pages",
      summary: "One page for the community’s Cat Samurai NFTs and ASC token, in Chinese and English.",
      points: [
        "Mint, reveal, change outfits, pull parts and trade them in a market.",
        "The ASC token page reads its value, buys with USDT and redeems on chain.",
        "Every number comes from four V2 contracts on Polygon, owned by a Safe multisig.",
      ],
      stack: "JavaScript, ethers.js, Solidity, Polygon",
      live: "https://chase5ws.github.io/2026_asc_web3_website/",
      liveLabel: "chase5ws.github.io/2026_asc_web3_website",
      source: "https://github.com/chase5ws/2026_asc_web3_website",
    },
    {
      id: "mbti", image: "./os/icons/mbti.png", icon: "swords", name: "WoW Forever MBTI quiz", status: "live", where: "GitHub Pages",
      summary: "Twenty story questions that pick a race and class for WoW Forever.",
      points: [
        "An unofficial fan quiz built on MBTI traits.",
        "Players send feedback through a linked Google Form.",
      ],
      stack: "HTML, CSS, JavaScript",
      live: "https://chase5ws.github.io/2026_wow_forever_mbti/",
      liveLabel: "chase5ws.github.io/2026_wow_forever_mbti",
      source: "https://github.com/chase5ws/2026_wow_forever_mbti",
    },
    {
      id: "wallpaper", image: "./os/icons/wallpaper.png", icon: "monitor", name: "Live Wallpaper new tab", status: "source", where: "Chrome extension",
      summary: "A Chrome extension that turns the new tab into an animated desktop.",
      points: [
        "Wallpapers from uploaded video or GIF, a URL, YouTube or six built-in animations.",
        "Clock, search, shortcuts and notes you drag anywhere on the page.",
        "Settings sync across open tabs and export to JSON.",
      ],
      stack: "Chrome Manifest V3, JavaScript, IndexedDB",
      source: "https://github.com/chase5ws/2026_google_wallpaper_customized",
    },
    {
      id: "form-limiter", image: "./os/icons/form-limiter.png", icon: "form", name: "Google Form limiter", status: "live", where: "Railway",
      summary: "A platform that caps sign-ups on Google Forms for many organisations.",
      points: [
        "Opens and closes each form by quota and schedule, checked every minute.",
        "Ranks entries in submission order and emails the waitlist when a seat frees up.",
        "Each organisation uses its own Google account and mail relay.",
      ],
      stack: "Node.js, built-in SQLite, Google APIs, Apps Script",
      live: "https://2026googleformlimiter-production.up.railway.app",
      liveLabel: "Platform sign-in",
      source: "https://github.com/chase5ws/2026_google_form_limiter",
    },
    {
      id: "easy-mcp", image: "./os/icons/easy-mcp.png", icon: "chip", name: "claude-easy-mcp", status: "private", where: "MCP server",
      summary: "One MCP server that gives every AI coding agent the same project memory.",
      points: [
        "Claude, Codex and Cursor share a work log, hand tasks to each other and keep lessons.",
        "Ships skills for design, scraping and software investigation.",
        "Unit tests plus an end-to-end MCP test on every push.",
      ],
      stack: "Node.js, MCP SDK, node:test, Railway",
    },
    {
      id: "it-ops-ai", image: "./os/icons/it-ops-ai.png", icon: "chat", name: "IT Ops AI Assistant", status: "building", where: "LINE bot",
      summary: "A LINE bot that answers IT questions from internal SOPs, and opens a ticket when it can’t.",
      points: [],
      stack: "Python, FastAPI, Gemini API, vector search, Docker, Cloud Run, GitHub Actions",
    },
  ],

  jobs: [
    { role: "IT Infrastructure Engineer", org: "Korrnell Hsinchu International Academy", when: "Apr 2026 – now", points: [
      "Automated internal workflows by integrating LINE Bot APIs (GOSUBAR) with school systems.",
      "Operate the UniFi network and ShareTech firewalls; wrote scripts and geo-blocking policies against probing and intrusion attempts.",
      "Administer Apple MDM and Google Workspace with zero-trust access and endpoint security baselines.",
    ] },
    { role: "Software Engineer, Automation and IT", org: "Hoyi Tech, Micron supplier", when: "Oct 2025 – Mar 2026", points: [
      "Built a Python (Tkinter) RFID data-sync tool talking to a PHP REST API backend, replacing manual IPC configuration across production stations.",
      "Implemented TSMC cybersecurity assessment controls: AD least-privilege groups, BitLocker, and OneDrive DLP.",
      "Ran AD, mail, Fortinet firewall, and access-control systems; documented the network topology.",
    ] },
    { role: "IT Systems Engineer", org: "Forward-tek (TWSE 7530), TSMC supplier", when: "May 2025 – Aug 2025", points: [
      "Maintained Digiwin ERP/EF and SQL databases under ISO 27001 controls.",
      "Operated Active Directory, Fortinet firewalls, VMware virtualization, and the corporate mail server.",
    ] },
  ],

  roadmap: [
    { when: "Nov – Dec 2026", title: "Cloud foundations", now: true, text: "Linux, Docker, GitHub Actions and the Google Cloud Associate Cloud Engineer exam. Ships the IT Ops AI Assistant." },
    { when: "Jan – Feb 2027", title: "Infrastructure as code", text: "Terraform, GKE basics and monitoring. Moves the ASC Discord bot onto Terraform-managed Google Cloud with CI/CD." },
    { when: "Mar – Apr 2027", title: "Next role", text: "Open to Cloud, DevOps, Platform and AI Automation Engineer roles in Hsinchu, Taipei or remote." },
  ],

  certs: [
    "Networking and Security in Google Cloud, Google Cloud Skills Boost, 2025",
    "Data, ML, and AI in Google Cloud, Google Cloud Skills Boost, 2025",
    "Cloud Computing Fundamentals, Google Cloud Skills Boost, 2025",
    "iThome Iron Man Competition, completion, 2026",
    "B.B.A. Information Management, National Yunlin University of Science and Technology",
  ],
};
