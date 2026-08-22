try {
  var t = localStorage.getItem("kakrat-theme");
  if (t) document.documentElement.setAttribute("data-theme", t);
} catch {}
