// Runs before paint. A saved choice (the header Dark/Light button) always
// wins; otherwise phones (narrower than Tailwind's md, 768px) default to
// dark and larger screens to light. Keep the breakpoint in step with the
// max-width media query in src/app/globals.css and ThemeToggle.tsx.
try {
  var t = localStorage.getItem("kakrat-theme");
  if (t !== "light" && t !== "dark") {
    t = window.matchMedia("(max-width: 767px)").matches ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", t);
} catch {}
