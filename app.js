(function () {
  "use strict";
  var KEY = "primogemKeeper.v1", SEEN = "astrawish.seen.v1";
  var TARGET = 28800, WISH = 160, DEFAULT_GOAL = "Your Character";
  var DEV_EMAIL = "emiljohnrey143@gmail.com";
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Number(n).toLocaleString("en-US"); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- Characters ---------- */
  var RAW = "Amber|Pyro|4;Bennett|Pyro|4;Chevreuse|Pyro|4;Diluc|Pyro|5;Dehya|Pyro|5;Durin|Pyro|5;Gaming|Pyro|4;Hu Tao|Pyro|5;Klee|Pyro|5;Mavuika|Pyro|5;Thoma|Pyro|4;Xiangling|Pyro|4;Xinyan|Pyro|4;Yoimiya|Pyro|5;The Knave|Pyro|5;Nicole|Pyro|5;Alice|Pyro|5;Noy|Pyro|5;" +
    "Kaeya|Cryo|4;Rosaria|Cryo|4;Diona|Cryo|4;Citlali|Cryo|5;Charlotte|Cryo|4;Kamisato Ayaka|Cryo|5;Qiqi|Cryo|5;Skirk|Cryo|5;Escoffier|Cryo|5;Tsaritsa|Cryo|5;" +
    "Barbara|Hydro|4;Xingqiu|Hydro|4;Yelan|Hydro|5;Mualani|Hydro|5;Sangonomiya Kokomi|Hydro|5;Kamisato Ayato|Hydro|5;Furina|Hydro|5;Tartaglia|Hydro|5;Nilou|Hydro|5;Mona|Hydro|5;Aino|Hydro|4;Neuvillette|Hydro|5;The Damselette|Hydro|5;Vodyanitsa|Hydro|5;" +
    "Jean|Anemo|5;Lynette|Anemo|4;Venti|Anemo|5;Sucrose|Anemo|4;Chasca|Anemo|5;Varka|Anemo|5;Scaramouche|Anemo|5;Yumemizuki Mizuki|Anemo|5;Xianyun|Anemo|5;Xiao|Anemo|5;Vesna|Anemo|?;" +
    "Lisa|Electro|4;Sethos|Electro|4;Ororon|Electro|4;Varesa|Electro|5;Beidou|Electro|4;Fischl|Electro|4;Razor|Electro|4;Raiden Shogun|Electro|5;Kujou Sara|Electro|4;Yae Miko|Electro|5;Clorinde|Electro|5;Cyno|Electro|5;Keqing|Electro|5;Flins|Electro|5;Ineffa|Electro|5;Alyosha|Electro|4;" +
    "Collei|Dendro|4;Yaoyao|Dendro|4;Alhaitham|Dendro|5;Kaveh|Dendro|4;Kinich|Dendro|5;Kirara|Dendro|4;Emilie|Dendro|5;Tighnari|Dendro|5;Lauma|Dendro|5;Nefer|Dendro|5;Nahida|Dendro|5;" +
    "Kachina|Geo|4;Noelle|Geo|4;Ningguang|Geo|4;Xilonen|Geo|5;Albedo|Geo|5;Arataki Itto|Geo|5;Chiori|Geo|5;Navia|Geo|5;Illuga|Geo|4;Linnea|Geo|5;Zibai|Geo|5;Zhongli|Geo|5;Marionette|Cryo|5;" +
    "Danica|Electro|5;Mitya|Electro|5;Valeriy|Electro|4;" +
    "Faruzan|Anemo|4;Iansan|Electro|4;Chongyun|Cryo|4;Sigewinne|Hydro|5;Wriothesley|Cryo|5;Sayu|Anemo|4;Gorou|Geo|4;Mika|Cryo|4;Lan Yan|Anemo|4;Freminet|Cryo|4;Dahlia|Hydro|4;Lyney|Pyro|5;Jahoda|Anemo|4;Shenhe|Cryo|5;Ganyu|Cryo|5;Eula|Cryo|5;Aloy|Cryo|5;Baizhu|Dendro|5;Kaedehara Kazuha|Anemo|5;Kuki Shinobu|Electro|4;Layla|Cryo|4;Shikanoin Heizou|Anemo|4;Dori|Electro|4;Yun Jin|Geo|4;Candace|Hydro|4;Yanfei|Pyro|4;Odette|Cryo|5;Lohen|Cryo|5";
  var CHARA = RAW.split(";").map(function (s) { var p = s.split("|"); return { n: p[0], el: p[1] === "?" ? null : p[1], r: p[2] === "?" ? null : +p[2] }; })
    .sort(function (a, b) { return a.n.localeCompare(b.n); });
  var ELEMENTS = ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  var CMAP = {}; CHARA.forEach(function (c) { CMAP[norm(c.n)] = c; });
  function findChara(name) { return CMAP[norm(name)] || null; }
  function elIcon(el) {
    var w = document.createElement("span"); w.className = "eli" + (el ? " eli-" + el.toLowerCase() : "");
    if (!el) { w.className += " eli-none"; w.textContent = "?"; return w; }
    var img = new Image(); img.alt = ""; img.src = "assets/" + el.toLowerCase() + ".png";
    img.onerror = function () { img.remove(); w.className += " eli-fallback"; w.textContent = el.charAt(0); };
    w.appendChild(img); return w;
  }
  function setIcon(id, el) { var h = $(id); h.innerHTML = ""; if (el) h.appendChild(elIcon(el)); }

  /* ---------- State ---------- */
  var mem = null, seenMem = false;
  function fresh() { return { total: 0, history: [], goal: DEFAULT_GOAL, fates: 0, streak: { count: 0, last: null }, owned: [], name: "Traveler", quests: {} }; }
  var curKey = KEY, memKey = KEY;
  function load() {
    var s = null;
    try { var raw = localStorage.getItem(curKey); if (raw) s = JSON.parse(raw); } catch (e) {}
    if (!s && mem && memKey === curKey) s = mem;
    if (!s || typeof s !== "object") return fresh();
    return normalize(s);
  }
  function normalize(s) {
    var d = fresh();
    for (var k in d) if (!(k in s)) s[k] = d[k];
    if (!Array.isArray(s.owned)) s.owned = [];
    if (!Array.isArray(s.history)) s.history = [];
    if (!s.quests || typeof s.quests !== "object") s.quests = {};
    if (!s.streak || typeof s.streak !== "object") s.streak = { count: 0, last: null };
    if (typeof s.fates !== "number" || !(s.fates >= 0)) s.fates = 0;
    return s;
  }
  var state = load();
  var fbDb = null, cloudReady = false, cloudSettled = false, cloudUnsub = null, pushT = null, cloudWarned = false, remindedDay = null;
  function writeLocal() { mem = state; memKey = curKey; try { localStorage.setItem(curKey, JSON.stringify(state)); } catch (e) {} }
  function save() { state.ts = Date.now(); writeLocal(); renderTop(); queuePush(); }
  function seen() { try { if (localStorage.getItem(SEEN) === "1") return true; } catch (e) {} return seenMem; }
  function setSeen() { seenMem = true; try { localStorage.setItem(SEEN, "1"); } catch (e) {} }

  function dayKey(d) { var m = d.getMonth() + 1, dd = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (dd < 10 ? "0" : "") + dd; }
  function daysBetween(a, b) {
    var pa = a.split("-"), pb = b.split("-");
    return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2], 12) - new Date(+pa[0], +pa[1] - 1, +pa[2], 12)) / 86400000);
  }
  function currentStreak() {
    var s = state.streak; if (!s || !s.last) return { n: 0, today: false };
    var gap = daysBetween(s.last, dayKey(new Date()));
    if (gap === 0) return { n: s.count, today: true };
    if (gap === 1) return { n: s.count, today: false };
    return { n: 0, today: false };
  }
  function bumpStreak(now) {
    var today = dayKey(now), s = state.streak, first = s.last !== today;
    if (!s.last) s.count = 1; else { var gap = daysBetween(s.last, today); if (gap === 1) s.count += 1; else if (gap > 1 || gap < 0) s.count = 1; }
    s.last = today; return first;
  }
  var FLAME = '<svg class="flame" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2c1 5 6 8 6 14.2A7 7 0 0 1 9 19.5c0-2.8 1.4-4.5 2.6-6 .5 2 1.6 2.8 2.6 3C13.6 12 14.2 6 16 2Z" fill="#FF9A55"/></svg>';
  function showStreakSaved() {
    var node = document.createElement("div"); node.className = "streakpop";
    node.innerHTML = FLAME + '<div class="snum">' + state.streak.count + '</div><div class="slab">day streak</div><p>Keep going and be consistent.</p>';
    $("toast").hidden = true;
    dialog({ title: "Streak Saved!", node: node, lock: true, buttons: [{ label: "Got it" }] });
  }
  function maybeRemind() {
    if (document.body.getAttribute("data-view") !== "dashboard") return;
    if (!(user || guest)) return;
    if (user && fbDb && !cloudSettled) return;
    var today = dayKey(new Date()); if (remindedDay === today) return;
    var st = currentStreak(); if (st.today) return;
    remindedDay = today;
    setTimeout(function () {
      if (openId || document.body.getAttribute("data-view") !== "dashboard" || currentStreak().today) return;
      var alive = st.n > 0;
      dialog({ title: alive ? "Keep your streak alive" : "Start your streak", lock: true,
        html: "<p>You haven't added any Primogems today. Don't forget to log in to the game and start farming to gain savings.</p><p>Then come back and add them here " + (alive ? "to keep your streak going." : "to start your streak.") + "</p>",
        buttons: [{ label: "Got it" }] });
    }, 350);
  }
  function parseInt0(str) {
    var t = String(str).replace(/[,\s]/g, "");
    if (t === "") return { empty: true };
    if (!/^\d+$/.test(t)) return { bad: true };
    return { v: parseInt(t, 10) };
  }
  function period() { var h = new Date().getHours(); return h >= 5 && h < 12 ? "morning" : h >= 12 && h < 18 ? "afternoon" : "evening"; }
  var curSky = null;
  function sky() {
    var p = period();
    if (p !== curSky) { curSky = p; var u = "url(assets/" + p + ".jpg)"; $("hero").style.backgroundImage = u; $("goalBanner").style.backgroundImage = u; }
    var g = p === "morning" ? "Good morning," : p === "afternoon" ? "Good afternoon," : "Good evening,";
    $("greeting").innerHTML = '<span style="white-space:nowrap">' + g + '</span> <span style="white-space:nowrap">Traveler!</span>';
  }

  /* ---------- Renderers ---------- */
  function renderTop() {
    var w = Math.floor(state.total / WISH) + state.fates;
    $("wishPill").textContent = fmt(w) + (w === 1 ? " wish" : " wishes");
    var nm = state.name || "Traveler", L = nm.charAt(0).toUpperCase();
    $("dName").textContent = nm; $("dAvatar").textContent = L;
    $("dSign").textContent = user ? "Sign out" : "Sign in";
  }
  function renderDash() {
    sky(); renderTop();
    var t = state.total;
    $("total").textContent = fmt(t);
    var pct = Math.min(100, t / TARGET * 100);
    $("pct").textContent = pct.toFixed(2) + "%";
    $("barFill").style.width = pct + "%";
    $("bar").setAttribute("aria-valuenow", pct.toFixed(2));
    $("barCur").textContent = fmt(t);
    $("targetName").textContent = state.goal; $("goalName").textContent = state.goal;
    var gc = findChara(state.goal);
    setIcon("goalIcon", gc && gc.el); setIcon("targetIcon", gc && gc.el);
    $("remain").textContent = fmt(Math.max(0, TARGET - t));
    $("fates").textContent = fmt(state.fates);
    var st = currentStreak();
    $("streak").textContent = st.n;
    $("streakUnit").textContent = st.n === 1 ? "day" : "days";
    $("streakHint").textContent = st.n === 0 ? "Add Primogems to start." : (st.today ? "Logged today. Keep it going." : "Log today to keep it alive.");
    var pw = Math.floor(t / WISH), wishes = pw + state.fates, budget = Math.round(TARGET / WISH), need = Math.max(0, budget - wishes);
    $("worst").innerHTML = "You have <b>" + fmt(wishes) + (wishes === 1 ? " wish" : " wishes") + "</b> saved (" + fmt(pw) + " from Primogems and " + fmt(state.fates) + " from Intertwined Fates). " +
      (need === 0 ? "That already covers the " + budget + "-wish budget." : "You still need <b>" + fmt(need) + "</b> more " + (need === 1 ? "wish" : "wishes") + " to reach the " + budget + "-wish budget.");
  }
  function renderHistory() {
    var list = $("histList"); list.innerHTML = "";
    var items = state.history.slice().reverse();
    $("histEmpty").hidden = items.length > 0;
    items.forEach(function (r) {
      var li = document.createElement("li");
      var l = document.createElement("div"); l.className = "l";
      var t = document.createElement("div"); t.className = "t";
      var isF = r.cur === "f", nm = isF ? "Intertwined Fates" : "Primogems";
      t.textContent = r.note ? r.note : (nm + (r.type === "add" ? " added" : " subtracted"));
      var d = document.createElement("div"); d.className = "d";
      var dt = new Date(r.ts);
      d.textContent = (r.type === "add" ? "Added" : "Subtracted") + " · " + dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      l.appendChild(t); l.appendChild(d);
      var a = document.createElement("div"); a.className = "amt " + r.type;
      a.textContent = (r.type === "add" ? "+" : "−") + fmt(r.amount);
      var ai = new Image(); ai.alt = isF ? "Intertwined Fates" : "Primogems"; ai.src = "assets/" + (isF ? "fates" : "primoGems") + ".png"; a.appendChild(ai);
      li.appendChild(l); li.appendChild(a); list.appendChild(li);
    });
  }
  function renderProfile() {
    var nm = state.name || "Traveler";
    $("pName").textContent = nm; $("pAvatar").textContent = nm.charAt(0).toUpperCase();
    $("nameInput").value = nm; $("nameErr").textContent = "";
    $("pLogin").textContent = user ? "Signed in" + (user.provider === "google" ? " with Google" : " with email") + ": " + user.email : "Login method: Guest, saved on this device";
    $("pSign").textContent = user ? "Sign out" : "Sign in";
    $("sOwned").textContent = state.owned.length; $("sSave").textContent = fmt(state.total); $("sStreak").textContent = currentStreak().n;
  }

  /* Chara */
  var editing = false, q = "", fel = "", picked = null;
  function charaFile(n) { return "assets/" + encodeURIComponent(n.toLowerCase()) + ".png"; }
  function makeTile(c, owned) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tile" + (owned ? "" : " locked"); b.setAttribute("data-name", c.n);
    var art = document.createElement("span"); art.className = "art";
    var ph = document.createElement("span"); ph.className = "ph"; ph.textContent = c.n.charAt(0); art.appendChild(ph);
    var img = new Image(); img.className = "cimg"; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    img.onload = function () { art.classList.add("has-img"); }; img.onerror = function () { img.remove(); };
    img.src = charaFile(c.n); art.appendChild(img);
    var elb = document.createElement("span"); elb.className = "elb"; elb.appendChild(elIcon(c.el)); art.appendChild(elb);
    var nm = document.createElement("span"); nm.className = "nm"; nm.textContent = c.n;
    var meta = document.createElement("span"); meta.className = "meta"; meta.appendChild(document.createTextNode(c.el || "Unknown element")); if (c.r) { var sr = document.createElement("span"); sr.className = "stars"; sr.setAttribute("aria-label", c.r + " star"); sr.textContent = "★★★★★".slice(0, c.r); meta.appendChild(sr); }
    b.appendChild(art); b.appendChild(nm); b.appendChild(meta);
    if (editing) {
      var badge = document.createElement("span"); badge.className = "badge"; badge.setAttribute("aria-hidden", "true"); badge.textContent = owned ? "✓" : "+"; b.appendChild(badge);
      b.setAttribute("aria-label", c.n + ", " + (owned ? "owned. Tap to mark as not owned." : "not owned. Tap to mark as owned."));
    } else {
      b.setAttribute("aria-label", c.n + ", " + (c.el || "unknown element") + (c.r ? ", " + c.r + " star" : "") + ", " + (owned ? "owned" : "not owned"));
    }
    return b;
  }
  function buildChips() {
    var box = $("elChips"); box.innerHTML = "";
    [""].concat(ELEMENTS).forEach(function (el) {
      var b = document.createElement("button"); b.type = "button"; b.className = "fchip"; b.setAttribute("data-el", el); b.setAttribute("aria-pressed", fel === el ? "true" : "false");
      if (el) b.appendChild(elIcon(el));
      b.appendChild(document.createTextNode(el || "All"));
      b.addEventListener("click", function () { fel = el; buildChips(); renderChara(); });
      box.appendChild(b);
    });
  }
  function renderChara(focusName) {
    var og = $("ownedGrid"), lg = $("lockedGrid"); og.innerHTML = ""; lg.innerHTML = "";
    var o = 0, l = 0, shownO = 0, shownL = 0, filtered = !!(q || fel), ql = q.toLowerCase();
    CHARA.forEach(function (c) {
      var own = state.owned.indexOf(c.n) >= 0;
      if (own) o++; else l++;
      if (ql && c.n.toLowerCase().indexOf(ql) < 0) return;
      if (fel && c.el !== fel) return;
      (own ? og : lg).appendChild(makeTile(c, own));
      if (own) shownO++; else shownL++;
    });
    $("ownedCount").textContent = filtered ? shownO + " shown · " + o + " total" : o + " / " + CHARA.length;
    $("lockedCount").textContent = filtered ? shownL + " shown · " + l + " total" : l;
    $("ownedEmpty").hidden = shownO > 0; $("lockedEmpty").hidden = shownL > 0;
    $("ownedEmpty").textContent = filtered ? "No owned characters match your search." : "No owned characters yet. Tap the pen at the top to mark the ones you have.";
    $("lockedEmpty").textContent = filtered ? "No characters here match your search." : "You own every character in the archive.";
    $("charaSub").textContent = o + " of " + CHARA.length + " characters owned.";
    $("editHint").hidden = !editing;
    var eb = $("charaEdit");
    eb.setAttribute("aria-pressed", editing ? "true" : "false");
    eb.setAttribute("aria-label", editing ? "Finish editing owned characters" : "Edit owned characters");
    $("penIcon").hidden = editing; $("doneLbl").hidden = !editing;
    if (focusName) { var t = document.querySelector('.tile[data-name="' + focusName.replace(/"/g, '\\"') + '"]'); if (t) t.focus(); }
  }
  $("charaEdit").addEventListener("click", function () { editing = !editing; renderChara(); if (!editing) toast("Collection saved"); });
  $("charaSearch").addEventListener("input", function (e) { q = e.target.value.trim(); renderChara(); });
  function onTile(e) {
    var t = e.target.closest ? e.target.closest(".tile") : null; if (!t) return;
    var name = t.getAttribute("data-name");
    if (editing) {
      var i = state.owned.indexOf(name), nowOwned = i < 0;
      var sib = t.nextElementSibling || t.previousElementSibling;
      var sibName = sib ? sib.getAttribute("data-name") : null;
      var holder = sib || t.closest("section.card");
      var before = holder.getBoundingClientRect().top;
      if (i >= 0) state.owned.splice(i, 1); else state.owned.push(name);
      if (nowOwned && state.goal === name) state.goal = DEFAULT_GOAL;
      save(); renderChara(); renderDash();
      var keep = sibName ? document.querySelector('.tile[data-name="' + sibName.replace(/"/g, '\\"') + '"]') : holder;
      if (keep) {
        window.scrollBy(0, keep.getBoundingClientRect().top - before);
        if (sibName && keep.focus) keep.focus({ preventScroll: true });
      }
      toast(name + (nowOwned ? " added to Owned" : " moved to Not owned"));
      return;
    }
    var c = findChara(name); picked = c;
    var own = state.owned.indexOf(c.n) >= 0;
    var node = document.createElement("div"); node.style.cssText = "display:flex;flex-direction:column;gap:10px";
    var who = document.createElement("div"); who.className = "who"; who.appendChild(elIcon(c.el));
    who.appendChild(document.createTextNode(c.el || "Unknown element")); if (c.r) { var sr2 = document.createElement("span"); sr2.className = "stars"; sr2.setAttribute("aria-label", c.r + " star"); sr2.textContent = "★★★★★".slice(0, c.r); who.appendChild(sr2); }
    var st = document.createElement("p"); st.textContent = own ? "Would you like to remove " + c.n + " from your owned characters?" : "Not owned yet. Use the pen at the top to mark owned characters.";
    node.appendChild(who); node.appendChild(st);
    if (own) {
      dialog({ title: c.n, node: node, buttons: [
        { label: "No", cls: "ghost" },
        { label: "Yes, remove", fn: function () { var j = state.owned.indexOf(c.n); if (j >= 0) state.owned.splice(j, 1); save(); renderChara(); renderDash(); toast(c.n + " moved to Not owned"); } }
      ] });
      return;
    }
    dialog({ title: c.n, node: node, buttons: [
      { label: "Close", cls: "ghost" },
      { label: "Set as Saving Goal", fn: function () { state.goal = c.n; save(); renderDash(); toast(c.n + " is now your saving goal"); } }
    ] });
  }
  $("ownedGrid").addEventListener("click", onTile); $("lockedGrid").addEventListener("click", onTile);

  /* ---------- Navigation page data ---------- */
  var NATC = { "Mondstadt": "mond", "Liyue": "liyue", "Inazuma": "inazuma", "Sumeru": "sumeru", "Fontaine": "fontaine", "Natlan": "natlan", "Nod-Krai": "nodkrai", "Snezhnaya": "snezhnaya" };
  var NAT_RE = /(Mondstadt|Liyue|Inazuma|Sumeru|Fontaine|Natlan|Nod-Krai|Snezhnaya)/g;
  function rich(s) { return esc(s).replace(NAT_RE, function (m) { return '<span class="nat nat-' + NATC[m] + '">' + m + "</span>"; }); }
  function shrine(n, c, tot, cnt, each, extra) { return { t: n, ic: "p", r: [["p", tot + " Primogems total"]], i: [cnt + " shrines", each + " Primogems each"].concat(extra ? [extra] : []) }; }
  function wp(n, c, tot) { return { t: n, ic: "p", r: [["p", tot + " Primogems total"]], i: [c + " Teleport Waypoints", "5 Primogems each discovery"] }; }
  var SOURCES = [
    { h: "Renewable", cards: [
      { t: "Daily Commissions", ic: "p", r: [["p", "60 Primogems every day"]], loc: "Adventurers' Guild, all nations, from Katheryne" },
      { t: "Spiral Abyss", ic: "p", r: [["p", "800 Primogems total"]], i: ["200 Primogems per floor"], loc: "Mondstadt" },
      { t: "Stygian Onslaught", ic: "p", r: [["p", "450 Primogems"]], i: ["A combat domain that resets monthly and gives rewards."], loc: "Liyue" },
      { t: "Imaginarium Theater", ic: "p", r: [["p", "1,000 Primogems total"]], i: ["When every act is completed and all Stella are collected"], loc: "Mondstadt" },
      { t: "Hoyolab Daily Login", ic: "p", r: [["p", "60 Primogems"]], i: ["Go to Check-in and log in every day. It resets every month. You get 20 Primogems 3 times, for a total of 60."] },
      { t: "Wonderland Treasures", ic: "p", r: [["p", "60 Primogems"]], i: ["Play any popular Miliastra Wonderland game to get 60 Primogems."] },
      { t: "Repertoire of Myriad Melodies", ic: "p", r: [["p", "60 Primogems"]], i: ["The game releases music events. Play the rhythm games many times at different difficulties to get rewards."] }
    ] },
    { h: "One-time Rewards", help: { title: "About One-time Rewards", html: "<p>You can get each of these rewards only once.</p><p>After you finish them and collect every reward, you will no longer get any more from them.</p>" }, cards: [
      { t: "Archon Quest", ic: "f", r: [["f", "Intertwined Fates"]], i: ["Once you finish a chapter and act, you get the rewards one time.", "New Archon Quests are added with every update."], img: "nav archon quest" },
      { t: "World Quest", ic: "p", r: [["p", "Primogems"]], i: ["You get the rewards one time for each World Quest you finish.", "More World Quests are added as the game updates and the map expands."], img: "nav world quest" },
      { t: "Shrine of Depths", ic: "p", r: [["p", "80+ Primogems (max)"]], i: ["Shrines of Depths can be found in all nations. Once you open them all, they never reset, so you can't claim them again."] },
      { t: "Character Story", ic: "p", r: [["p", "60 Primogems per character story"]], i: ["Some characters also unlock Bosses, Domains and Realms that you can't reach by exploration."] },
      { t: "Serenitea Pot", ic: "p", r: [["p", "40+ Primogems"]], i: ["Make furnishings for your companions and level up their Trust Rank to get rewards."] },
      { t: "Adventure Rank", ic: "p", r: [["p", "60+ Primogems"]], i: ["Some Adventure Ranks give a random amount of Primogems."] },
      { t: "Tutorial", ic: "p", r: [["p", "1 Primogem each"]], i: ["Discover new gameplay and open its tutorial to get 1 Primogem for each tutorial."] },
      { t: "One-Time Domain", ic: "p", r: [["p", "40 Primogems"]], i: ["A Domain that gives rewards once, after you finish the challenge."] }
    ] },
    { h: "Limited Availability", cards: [
      { t: "Redemption Codes", ic: "p", r: [["p", "40+ Primogems"]], i: ["HoYoverse releases codes on social media and during livestreams. Copy a code and redeem it to get rewards."] },
      { t: "Web Event", ic: "p", r: [["p", "Primogems"]], i: ["The game releases web events. Log in and take part to get rewards."] },
      { t: "Character Test Runs", ic: "p", r: [["p", "40 Primogems (20 each)"]], i: ["When the banners update, there are 2 banners with 2 test runs. Play the featured character to get rewards."] },
      { t: "Update Compensation", ic: "p", r: [["p", "600 Primogems"]], i: ["With every update, the game gives two mails of 300 Primogems each. Claim them from your Mailbox before they expire."] }
    ] },
    { h: "Exploration", cards: [
      { t: "Discover Waypoints", ic: "p", r: [["p", "5 Primogems each"]], i: ["Unlock all of the Waypoints in every region to explore undiscovered places."], img: "discover waypoints" },
      { t: "Compass & Collect", ic: "p", i: ["Finish the Reputation quests and get the Compass to locate all of the Chests in the region.", "Note: every region has its own Compass, so you have to get them one by one."], img: "compass and collect" },
      { t: "Complete & Maximize", ic: "p", i: ["Take on World Quests and max out the regions to discover other Realms.", "Examples: Temple of Space, Enkanomiya, Sea of Bygone Eras, Frostmoon Enclave and more."], img: "complete and maximize" }
    ] },
    { h: "Special Regional Offerings", help: true, cards: [
      { t: "Sacred Sakura Favor", ic: "f", r: [["f", "10 Intertwined Fates"]], i: ["Offering tree"], loc: "Inazuma", req: "Electro Sigils" },
      { t: "Dragonspine Offering Tree", ic: "f", r: [["f", "2 Intertwined Fates"]], loc: "Mondstadt (Dragonspine)", req: "Crimson Agate" },
      { t: "Tree of Dreams", ic: "f", r: [["f", "10 Intertwined Fates total"]], loc: "Sumeru (Vanarana)", req: "Dendro Sigils" },
      { t: "Tona's Flame Offering", ic: "p", r: [["p", "2,500 Primogems total"]], i: ["50 Primogems per level"], loc: "Natlan", req: "Pyro Sigils" },
      { t: "Fountain of Lucine Offering", ic: "pf", r: [["p", "16,889 Primogems max total"], ["f", "18 Intertwined Fates"]], loc: "Fontaine", req: "Hydro Sigils" },
      { t: "Memory Core", ic: "p", r: [["p", "500 Primogems total"]], i: ["Temple of Space", "50 Primogems per offer"], loc: "Mondstadt", req: "Memory Factor (not Anemo Sigils)" },
      { t: "Nod-Krai Meeting Points", ic: "p", r: [["p", "250 Primogems total"]], i: ["50 Primogems each offering, by exploration percent", "8 locations"], more: "Krumkake Craftshop, Frostmoon Enclave, Final Night Cemetery, The Witch's Garden, Favonius Keep, Cliffwatch Camp, Nuur Stone Circle, Curtain-Form Blackbody Containment Lab", req: "Moon Sigils" },
      { t: "Snezhnaya Meeting Points", ic: "p", r: [["p", "1,250 Primogems total"]], i: ["As of version 7.2 this is not official"], req: "Cryo Sigils" }
    ] },
    { h: "Statue of the Seven Offerings", cards: [
      { t: "Mondstadt", ic: "p", r: [["p", "90 Primogems total"]], i: ["10 Primogems per worship"] },
      { t: "Liyue", ic: "p", r: [["p", "90 Primogems total"]], i: ["10 Primogems per worship"] },
      { t: "Inazuma", ic: "p", r: [["p", "540 Primogems total"]], i: ["60 Primogems per worship", "Requires up to 180 Electroculi"] },
      { t: "Sumeru", ic: "p", r: [["p", "540 Primogems total"]], i: ["60 Primogems per worship", "Requires up to 270 Dendroculi"] },
      { t: "Fontaine", ic: "p", r: [["p", "540 Primogems total"]], i: ["60 Primogems per worship", "Requires up to 270 Hydroculi"] },
      { t: "Natlan", ic: "p", r: [["p", "900 Primogems total"]], i: ["100 Primogems per worship", "Requires 270 Pyroculi"] },
      { t: "Nod-Krai", ic: "p", r: [["p", "900 Primogems total"]], i: ["100 Primogems per worship", "Requires 270 Lunoculi"] },
      { t: "Snezhnaya", ic: "p", r: [["p", "900 Primogems total"]], i: ["100 Primogems per worship", "Requires 270 Cryoculi"] }
    ] },
    { h: "Shrines of Depths", help: { title: "How to get", html: "<p>Each Shrine of Depths requires 1 key to open.</p><p>You get these keys from the Statue of the Seven offerings.</p>" }, cards: [
      shrine("Mondstadt", 0, "400", 10, 40), shrine("Liyue", 0, "400", 10, 40), shrine("Inazuma", 0, "400", 10, 40),
      shrine("Sumeru", 0, "400", 10, 40), shrine("Fontaine", 0, "400", 10, 40), shrine("Natlan", 0, "400", 10, 40),
      shrine("Nod-Krai", 0, "560", 7, 80),
      { t: "Snezhnaya", ic: "p", r: [["p", "560 Primogems total"]], i: ["About 7 shrines (as of version 7.2)", "80 Primogems each"] }
    ] },
    { h: "Waypoints", cards: [
      wp("Mondstadt", 63, "315"), wp("Liyue", 90, "450"), wp("Inazuma", 71, "355"), wp("Sumeru", 110, "550"),
      wp("Fontaine", 109, "540"), wp("Natlan", 145, "725"), wp("Nod-Krai", 111, "555"),
      { t: "Snezhnaya", ic: "p", r: [["p", "505 Primogems total"]], i: ["101 Teleport Waypoints (as of version 7.2, not official)", "5 Primogems each discovery"] }
    ] },
    { h: "Chests", cards: [
      { t: "Common Chest", ic: "p", r: [["p", "0 to 2 Primogems"]] },
      { t: "Exquisite Chest", ic: "p", r: [["p", "2 to 5 Primogems"]] },
      { t: "Remarkable Chest", ic: "p", r: [["p", "0 to 5 Primogems"]] },
      { t: "Precious Chest", ic: "p", r: [["p", "10 Primogems"]] },
      { t: "Luxurious Chest", ic: "p", r: [["p", "10 to 50 Primogems"]] }
    ] },
    { h: "Top up & Purchases", help: { title: "Reminder", html: "<p>Top ups and purchases are not recommended if you are a beginner. It is much better to play the game fully and enjoy it.</p><p>However, you can use them to get a lot of Primogems in a short time.</p>" }, cards: [
      { t: "Genesis Crystal", ic: "p", r: [["p", "1 Genesis Crystal = 1 Primogem"]] },
      { t: "Blessing of the Welkin Moon", ic: "p", r: [["p", "2,700 Primogems over 30 days"]], i: ["Instantly get 300 Genesis Crystals and 90 Primogems, plus 90 Primogems for every daily login.", "Note: Days you miss give no reward."] },
      { t: "Gnostic Hymn", ic: "p", r: [["p", "680 Primogems"]], i: ["Get 680 Primogems once you reach the max level, 50."] },
      { t: "Gnostic Chorus", ic: "p", r: [["p", "680 Primogems"]], i: ["Get 680 Primogems once you reach the max level, 50."] }
    ] }
  ];
  (function () {
    var pre = { "Statue of the Seven Offerings": "statue", "Shrines of Depths": "shrine", "Waypoints": "waypoint" };
    SOURCES.forEach(function (sec) {
      sec.cards.forEach(function (c) {
        var base = c.t.toLowerCase();
        if (pre[sec.h]) { c.img = pre[sec.h] + " " + base; c.imgFb = pre[sec.h]; } else c.img = c.img || base;
      });
    });
  })();
  function iconImg(k, cls) { var i = new Image(); i.alt = ""; i.src = "assets/" + (k === "p" ? "primoGems" : "fates") + ".png"; if (cls) i.className = cls; return i; }
  function cardImg(c) {
    var box = document.createElement("div"); box.className = "srcimg"; box.setAttribute("aria-hidden", "true");
    var ph = document.createElement("span");
    var names = [c.img, c.imgFb].filter(Boolean), i = 0, im = new Image(); im.alt = ""; im.className = "pic"; im.decoding = "async";
    function next() { if (i < names.length) im.src = "assets/" + names[i++] + ".png"; else im.remove(); }
    im.onerror = next; im.onload = function () { ph.remove(); };
    box.appendChild(im); next(); return box;
  }
  function buildCard(c) {
    var a = document.createElement("article"); a.className = "src";
    var ic = document.createElement("div"); ic.className = "srcic"; (c.ic || "p").split("").forEach(function (k) { ic.appendChild(iconImg(k)); });
    var h = document.createElement("h3"); h.innerHTML = rich(c.t);
    var info = document.createElement("div"); info.className = "srcinfo";
    (c.r || []).forEach(function (r) { var p = document.createElement("p"); p.className = "rw"; p.appendChild(iconImg(r[0])); var s = document.createElement("span"); s.innerHTML = rich(r[1]); p.appendChild(s); info.appendChild(p); });
    (c.i || []).forEach(function (t) { var p = document.createElement("p"); p.innerHTML = rich(t); info.appendChild(p); });
    if (c.more) { var dt = document.createElement("details"); dt.className = "more"; var sm = document.createElement("summary"); sm.textContent = "Show locations"; var mp = document.createElement("p"); mp.textContent = c.more; dt.appendChild(sm); dt.appendChild(mp); info.appendChild(dt); }
    if (c.loc) { var p1 = document.createElement("p"); p1.innerHTML = "Location: " + rich(c.loc); info.appendChild(p1); }
    if (c.req) { var p2 = document.createElement("p"); p2.innerHTML = "Required: " + rich(c.req); info.appendChild(p2); }
    a.appendChild(cardImg(c)); a.appendChild(h); a.appendChild(info); return a;
  }
  function buildEmptyCard() {
    var a = document.createElement("article"); a.className = "src empty";
    var b = document.createElement("div"); b.className = "srcimg"; b.setAttribute("aria-hidden", "true");
    var t = document.createElement("h3"); t.textContent = "Coming soon";
    var info = document.createElement("div"); info.className = "srcinfo"; var p = document.createElement("p"); p.textContent = "Details will be added later."; info.appendChild(p);
    a.appendChild(b); a.appendChild(t); a.appendChild(info); return a;
  }
  function buildNav() {
    var box = $("navSections"); box.innerHTML = "";
    SOURCES.forEach(function (s) {
      var sec = document.createElement("section"); sec.className = "sec";
      var h = document.createElement("h2"); h.appendChild(document.createTextNode(s.h));
      if (s.help) {
        var hb = document.createElement("button"); hb.type = "button"; hb.className = "helpbtn"; hb.textContent = "?"; var hp = s.help === true ? { title: "Guide: Elemental Sigils", html: "<p>Elemental Sigils are needed for the regional offerings. You can get them from:</p><p><b>Regional chests</b>: Common, Exquisite, Luxurious and Precious chests.</p><p><b>Statue of the Seven</b> worship.</p><p><b>Shrine of Depths</b> chests.</p>" } : s.help; hb.setAttribute("aria-label", hp.title);
        hb.addEventListener("click", function () {
          dialog({ title: hp.title, html: hp.html, buttons: [{ label: "Got it" }] });
        });
        h.appendChild(hb);
      }
      sec.appendChild(h);
      var wrap = document.createElement("div"); wrap.className = "railwrap";
      var rail = document.createElement("div"); rail.className = "rail"; rail.setAttribute("role", "region"); rail.setAttribute("aria-label", s.h); rail.tabIndex = 0;
      s.cards.forEach(function (c) { rail.appendChild(buildCard(c)); });
      for (var ei = 0; ei < (s.empty || 0); ei++) rail.appendChild(buildEmptyCard());
      function mk(dir, svg) {
        var b = document.createElement("button"); b.type = "button"; b.className = "railbtn " + (dir < 0 ? "prev" : "next"); b.setAttribute("aria-label", dir < 0 ? "Scroll left" : "Scroll right");
        b.innerHTML = svg; b.addEventListener("click", function () { rail.scrollBy({ left: dir * Math.max(240, rail.clientWidth * 0.8), behavior: "smooth" }); }); return b;
      }
      wrap.appendChild(rail);
      wrap.appendChild(mk(-1, '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'));
      wrap.appendChild(mk(1, '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'));
      sec.appendChild(wrap); box.appendChild(sec);
    });
  }

  /* ---------- Quests ---------- */
  var FATE_PRIMO = WISH; /* 1 Intertwined Fate = 160 Primogems */
  var prefersReduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var QUEST_CATS = [
    { id: "archon", t: "Archon Quest", list: [
      { id: "aq1", t: "Prologue | Act I | The Outlander Who Caught the Wind", r: "Mondstadt", f: 1 },
      { id: "aq2", t: "Prologue | Act II | For a Tomorrow Without Tears", r: "Mondstadt", f: 1 },
      { id: "aq3", t: "Prologue | Act III | Song of the Dragon and Freedom", r: "Mondstadt", f: 1 },
      { id: "aq4", t: "Interlude Chapter | Act IV | Paralogism", r: "Mondstadt", f: 1 },
      { id: "aq5", t: "Chapter I | Act I | Of the Land Amidst Monoliths", r: "Liyue", f: 1 },
      { id: "aq6", t: "Chapter I | Act II | Farewell, Archaic Lord", r: "Liyue", f: 1 },
      { id: "aq7", t: "Chapter I | Act III | A New Star Approaches", r: "Liyue", f: 1 },
      { id: "aq8", t: "Chapter I | Act IV | We Will Be Reunited", r: "Liyue", f: 1 },
      { id: "aq9", t: "Interlude Chapter | Act I | The Crane Returns on the Wind", r: "Liyue", f: 1 },
      { id: "aq10", t: "Interlude Chapter | Act II | Perilous Trail", r: "Liyue", f: 1 },
      { id: "aq11", t: "Chapter II | Prologue | Autumn Winds, Scarlet Leaves", r: "Inazuma", f: 1 },
      { id: "aq12", t: "Chapter II | Act I | The Immovable God and the Eternal Euthymia", r: "Inazuma", f: 1 },
      { id: "aq13", t: "Chapter II | Act II | Stillness, the Sublimation of Shadow", r: "Inazuma", f: 1 },
      { id: "aq14", t: "Chapter II | Act III | Omnipresence Over Mortals", r: "Inazuma", f: 1 },
      { id: "aq15", t: "Chapter II | Act IV | Requiem of the Echoing Depths", r: "Inazuma / Liyue", f: 1 },
      { id: "aq16", t: "Chapter III | Act I | Through Mists of Smoke and Forests Dark", r: "Sumeru", f: 1 },
      { id: "aq17", t: "Chapter III | Act II | The Morn a Thousand Roses Brings", r: "Sumeru", f: 1 },
      { id: "aq18", t: "Chapter III | Act III | Dreams, Emptiness, Deception", r: "Sumeru", f: 1 },
      { id: "aq19", t: "Chapter III | Act IV | King Deshret and the Three Magi", r: "Sumeru", f: 1 },
      { id: "aq20", t: "Chapter III | Act V | Akasha Pulses, the Kalpa Flame Rises", r: "Sumeru", f: 1 },
      { id: "aq21", t: "Chapter III | Act VI | Caribert", r: "Sumeru", f: 1 },
      { id: "aq22", t: "Interlude Chapter | Act III | Inversion of Genesis", r: "Sumeru", f: 1 },
      { id: "aq23", t: "Chapter IV | Act I | Prelude of Blancheur and Noirceur", r: "Fontaine", f: 1 },
      { id: "aq24", t: "Chapter IV | Act II | As Light Rain Falls Without Reason", r: "Fontaine", f: 1 },
      { id: "aq25", t: "Chapter IV | Act III | To the Stars Shining in the Depths", r: "Fontaine", f: 1 },
      { id: "aq26", t: "Chapter IV | Act IV | Cataclysm's Quickening", r: "Fontaine", f: 1 },
      { id: "aq27", t: "Chapter IV | Act V | Masquerade of the Guilty", r: "Fontaine", f: 1 },
      { id: "aq28", t: "Chapter IV | Act VI | Bedtime Story", r: "Fontaine", f: 1 },
      { id: "aq29", t: "Chapter V | Act I | Flowers Resplendent on the Sun-Scorched Sojourn", r: "Natlan", f: 1 },
      { id: "aq30", t: "Chapter V | Act II | Black Stone Under a White Stone", r: "Natlan", f: 1 },
      { id: "aq31", t: "Chapter V | Act III | Beyond the Smoke and Mirrors", r: "Natlan", f: 1 },
      { id: "aq32", t: "Chapter V | Act IV | The Rainbow Destined to Burn", r: "Natlan", f: 1 },
      { id: "aq33", t: "Chapter V | Interlude | All Fires Fuel the Flame", r: "Natlan", f: 1 },
      { id: "aq34", t: "Chapter V | Act V | Incandescent Ode of Resurrection", r: "Natlan", f: 1 },
      { id: "aq35", t: "Chapter V | Act VI | A Space and Time for You", r: "Natlan", f: 1 },
      { id: "aq36", t: "Song of the Welkin Moon | Prelude | The Journey Home", r: "Nod-Krai", f: 1 },
      { id: "aq37", t: "Song of the Welkin Moon | Act I | A Dance of Snowy Tides and Hoarfrost Groves", r: "Nod-Krai", f: 1 },
      { id: "aq38", t: "Song of the Welkin Moon | Act II | Elegy of Dust and Lamplight", r: "Nod-Krai", f: 1 },
      { id: "aq39", t: "Song of the Welkin Moon | Act III | A Nation That Doesn't Exist", r: "Nod-Krai", f: 1 },
      { id: "aq40", t: "Song of the Welkin Moon | Act IV | An Elegy for Faded Moonlight", r: "Nod-Krai", f: 1 },
      { id: "aq41", t: "Song of the Welkin Moon | Act V | A Nocturne of the Far North", r: "Nod-Krai", f: 1 },
      { id: "aq42", t: "Song of the Welkin Moon | Act VI | Melting Moonlight in the Morning Mist", r: "Nod-Krai", f: 1 },
      { id: "aq43", t: "Song of the Welkin Moon | Act VII | A Traveler on a Winter's Night", r: "Nod-Krai", f: 1 },
      { id: "aq44", t: "Song of the Welkin Moon | Act VIII | True Moon", r: "Nod-Krai", f: 1 },
      { id: "aq45", t: "Song of the Welkin Moon | Act IX | As All Falls to Emptiness", r: "Nod-Krai / Sumeru", f: 1 },
      { id: "aq46", t: "Song of the Welkin Moon | Act X | Truth Amongst the Pages of Purana", r: "Nod-Krai / Sumeru", f: 1 },
      { id: "aq47", t: "Chapter VII | Act I | Everwinter Without Mercy", r: "Snezhnaya", f: 1 },
      { id: "aq48", t: "Chapter VII | Act II | Wraith's Nocturne", r: "Snezhnaya", f: 1 },
      { id: "aq49", t: "Chapter VII | Act III | White Night, Like a Dream Upon Waking", r: "Snezhnaya", f: 1 },
      { id: "aq50", t: "Chapter VII | Act IV | A Rekviem for the Underworld", r: "Snezhnaya", f: 1 },
      { id: "aq51", t: "Chapter VII | Act V | Hour of Ruin", r: "Snezhnaya", f: 1 },
      { id: "aq52", t: "Chapter VII | Act VI | A Yesterday Sent From Beyond", r: "Snezhnaya", f: 1 }
    ] },
    { id: "world", t: "World Quest", list: [
      { id: "wq1", t: "Break the Sword Cemetery Seal", r: "Mondstadt", p: 50 },
      { id: "wq2", t: "Time and Wind", r: "Mondstadt", p: 60 },
      { id: "wq3", t: "In the Mountains", r: "Mondstadt (Dragonspine)", p: 60 },
      { id: "wq4", t: "A Land Entombed", r: "Mondstadt (Dragonspine)", p: 50 },
      { id: "wq5", t: "The Festering Fang", r: "Mondstadt (Dragonspine)", p: 50 },
      { id: "wq6", t: "A Long Day in the Mountains", r: "Mondstadt", p: 40, plus: 1 },
      { id: "wq7", t: "Treasure Lost, Treasure Found", r: "Liyue", p: 80 },
      { id: "wq8", t: "The Chi of Yore", r: "Liyue", p: 60 },
      { id: "wq9", t: "Nine Pillars of Peace", r: "Liyue", p: 50 },
      { id: "wq10", t: "Luhua Landscape", r: "Liyue", p: 50 },
      { id: "wq11", t: "The Tree Who Stands Alone", r: "Liyue", p: 50 },
      { id: "wq12", t: "The Chasm Delvers", r: "Liyue (The Chasm)", p: 300, plus: 1 },
      { id: "wq13", t: "Valor's Afterglow", r: "Liyue (The Chasm)", p: 100, plus: 1 },
      { id: "wq14", t: "Chenyu's Blessings of Sunken Jade", r: "Liyue (Chenyu Vale)", p: 300, plus: 1 },
      { id: "wq15", t: "Sacred Sakura Cleansing Ritual", r: "Inazuma", p: 230, plus: 1 },
      { id: "wq16", t: "Tatara Tales", r: "Inazuma", p: 250, plus: 1 },
      { id: "wq17", t: "Orobashi's Legacy", r: "Inazuma", p: 230, plus: 1 },
      { id: "wq18", t: "Seirai Stormchasers", r: "Inazuma", p: 180, plus: 1 },
      { id: "wq19", t: "Through the Mists", r: "Inazuma (Tsurumi Island)", p: 250, plus: 1 },
      { id: "wq20", t: "The Moon-Bathed Deep", r: "Inazuma (Watatsumi Island)", p: 180, plus: 1 },
      { id: "wq21", t: "From Dusk to Dawn in Byakuyakoku", r: "Inazuma (Enkanomiya)", p: 300, plus: 1 },
      { id: "wq22", t: "Aranyaka", r: "Sumeru", p: 1600, plus: 1 },
      { id: "wq23", t: "Agnihotra Sutra", r: "Sumeru", p: 200, plus: 1 },
      { id: "wq24", t: "Varuna Gatha", r: "Sumeru", p: 200, plus: 1 },
      { id: "wq25", t: "Vimana Agama", r: "Sumeru", p: 200, plus: 1 },
      { id: "wq26", t: "Golden Slumber", r: "Sumeru", p: 280, plus: 1 },
      { id: "wq27", t: "Old Notes and New Friends", r: "Sumeru", p: 150, plus: 1 },
      { id: "wq28", t: "The Dirge of Bilqis", r: "Sumeru", p: 400, plus: 1 },
      { id: "wq29", t: "Apocalypse Lost", r: "Sumeru", p: 150, plus: 1 },
      { id: "wq30", t: "Khvarena of Good and Evil", r: "Sumeru", p: 400, plus: 1 },
      { id: "wq31", t: "Ancient Colors", r: "Fontaine", p: 200, plus: 1 },
      { id: "wq32", t: "Ann of the Narzissenkreuz", r: "Fontaine", p: 250, plus: 1 },
      { id: "wq33", t: "Unfinished Comedy", r: "Fontaine", p: 200, plus: 1 },
      { id: "wq34", t: "In the Wake of Narcissus", r: "Fontaine", p: 300, plus: 1 },
      { id: "wq35", t: "The Wild Fairy of Erinnyes", r: "Fontaine", p: 200, plus: 1 },
      { id: "wq36", t: "Questioning Melusine and Answering Machine", r: "Fontaine", p: 180, plus: 1 },
      { id: "wq37", t: "Canticles of Harmony", r: "Fontaine (Sea of Bygone Eras)", p: 300, plus: 1 },
      { id: "wq38", t: "Between Pledge and Forgettance", r: "Natlan", p: 250, plus: 1 },
      { id: "wq39", t: "In the Footsteps of the Chosen of Dragons", r: "Natlan", p: 300, plus: 1 },
      { id: "wq40", t: "Lost Traveler in the Ashen Realm", r: "Natlan", p: 300, plus: 1 },
      { id: "wq41", t: "From One Case to Another", r: "Natlan", p: 150, plus: 1 },
      { id: "wq42", t: "Chronicler of the Crumbling City", r: "Natlan (Ancient Sacred Mountain)", p: 300, plus: 1 },
      { id: "wq43", t: "Beyond Silver and Fine Gold", r: "Nod-Krai", p: 200, plus: 1 },
      { id: "wq44", t: "Colors of Emptiness", r: "Nod-Krai", p: 150, plus: 1 },
      { id: "wq45", t: "East of the Moon, West of the Sun", r: "Nod-Krai", p: 200, plus: 1 },
      { id: "wq46", t: "Moon Gazing", r: "Nod-Krai", p: 150, plus: 1 },
      { id: "wq47", t: "Nightingale's Song", r: "Nod-Krai", p: 200, plus: 1 },
      { id: "wq48", t: "Polkka Beneath the Moon's Oracle", r: "Nod-Krai", p: 200, plus: 1 },
      { id: "wq49", t: "The Unmanned Vessel", r: "Nod-Krai", p: 150, plus: 1 },
      { id: "wq50", t: "An Ancient Song of Flowing Crystal and Stone Chests", r: "Snezhnaya", p: 250, plus: 1 },
      { id: "wq51", t: "Hesperides of Love and Hate", r: "Snezhnaya", p: 200, plus: 1 },
      { id: "wq52", t: "In the Dwelling of Life", r: "Snezhnaya", p: 150, plus: 1 },
      { id: "wq53", t: "Secret Tsarist Assignment", r: "Snezhnaya", p: 150, plus: 1 },
      { id: "wq54", t: "Her Palace Collapses Into the Blizzard", r: "Snezhnaya", p: 200, plus: 1 }
    ] }
  ];
  var openCat = { archon: false, world: false, archive: false }, logoFail = {};
  function questById(id) {
    for (var i = 0; i < QUEST_CATS.length; i++) for (var j = 0; j < QUEST_CATS[i].list.length; j++) if (QUEST_CATS[i].list[j].id === id) return QUEST_CATS[i].list[j];
    return null;
  }
  function rewardText(q) { return q.p ? fmt(q.p) + (q.plus ? "+" : "") + " Primogems" : fateText(q.f); }
  function gainText(q) { return q.p ? fmt(q.p) + " Primogems" : fateText(q.f); }
  function regKey(r) { return r.split(" / ")[0].split(" (")[0]; }
  function fateText(n) { return n + " Intertwined Fate" + (n === 1 ? "" : "s"); }
  function qSection(id, title, count, fill) {
    var sec = document.createElement("section"); sec.className = "qcat";
    var h = document.createElement("button"); h.type = "button"; h.className = "qhead"; h.setAttribute("aria-expanded", openCat[id] ? "true" : "false");
    var qi = id === "archon" ? "archon quest" : id === "world" ? "world quest" : "";
    h.innerHTML = (qi ? '<img class="qico" src="assets/' + qi + '.png" alt="" width="26" height="26">' : "") + '<span class="qt">' + esc(title) + '</span><span class="qc">' + esc(count) + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    var ul = document.createElement("ul"); ul.className = "qlist"; ul.hidden = !openCat[id];
    h.addEventListener("click", function () { openCat[id] = !openCat[id]; h.setAttribute("aria-expanded", openCat[id] ? "true" : "false"); ul.hidden = !openCat[id]; });
    fill(ul); sec.appendChild(h); sec.appendChild(ul); return sec;
  }
  function qItem(q, rec) {
    var done = !!rec;
    var li = document.createElement("li"); li.className = "qwrap"; li.setAttribute("data-id", q.id);
    if (!done) { var bg = document.createElement("div"); bg.className = "qbg"; bg.setAttribute("aria-hidden", "true"); bg.textContent = "Mark done, no savings"; li.appendChild(bg); }
    var b = document.createElement(done ? "div" : "button"); if (!done) b.type = "button";
    b.className = "quest" + (done ? " isdone" : "");
    var base = regKey(q.r), key = base.toLowerCase().replace(/[^a-z]/g, "");
    var lg = document.createElement("span"); lg.className = "qlogo"; lg.setAttribute("aria-hidden", "true");
    var ph = document.createElement("span"); ph.className = "qph nat nat-" + NATC[base]; ph.textContent = base.charAt(0); lg.appendChild(ph);
    if (!logoFail[key]) {
      var im = new Image(); im.alt = ""; im.decoding = "async";
      im.onload = function () { ph.remove(); };
      im.onerror = function () { logoFail[key] = 1; im.remove(); };
      im.src = "assets/" + key + "_logo.png"; lg.appendChild(im);
    }
    var tx = document.createElement("span"); tx.className = "qtxt";
    var rewardHtml = done
      ? (rec.added ? "Added to savings (+" + gainText(q) + ")" : "Marked as done, not added to savings")
      : rewardText(q);
    tx.innerHTML = '<span class="qreg">' + rich(q.r) + '</span><span class="qname">' + esc(q.t) + '</span><span class="qrew">' + (done ? "" : '<img src="assets/' + (q.p ? "primoGems" : "fates") + '.png" alt="">') + esc(rewardHtml) + "</span>";
    b.appendChild(lg); b.appendChild(tx);
    if (!done) b.setAttribute("aria-label", q.t + ", " + q.r + ", " + rewardText(q) + ". Tap to complete. Swipe left or press the left arrow key to mark done without adding to savings.");
    li.appendChild(b); return li;
  }
  function renderQuests() {
    var root = $("questRoot"); root.innerHTML = "";
    QUEST_CATS.forEach(function (cat) {
      var left = cat.list.filter(function (q) { return !(state.quests[q.id] && state.quests[q.id].done); });
      root.appendChild(qSection(cat.id, cat.t, left.length + " left", function (ul) {
        left.forEach(function (q) { ul.appendChild(qItem(q, null)); });
        if (!left.length) { var e = document.createElement("li"); e.className = "emptyline"; e.textContent = "All quests here are done. Check the Archive."; ul.appendChild(e); }
      }));
    });
    var arch = [];
    QUEST_CATS.forEach(function (cat) { cat.list.forEach(function (q) { var r = state.quests[q.id]; if (r && r.done) arch.push({ q: q, r: r }); }); });
    arch.sort(function (a, b) { return b.r.ts - a.r.ts; });
    root.appendChild(qSection("archive", "Archive", arch.length + " done", function (ul) {
      arch.forEach(function (x) { ul.appendChild(qItem(x.q, x.r)); });
      if (!arch.length) { var e = document.createElement("li"); e.className = "emptyline"; e.textContent = "Done quests will appear here."; ul.appendChild(e); }
    }));
  }
  function qDialogInfo(q) { return '<div class="who"><b>' + esc(q.t) + '</b></div><p>Reward: <b>' + rewardText(q) + "</b>" + "" + "</p>"; }
  function tapQuest(q) {
    dialog({ title: "Notice", html: "<p>Are you done completing this quest?</p>" + qDialogInfo(q),
      buttons: [{ label: "No", cls: "ghost" }, { label: "Yes, add to my savings", fn: function () { finishQuest(q, true); } }] });
  }
  function swipeQuest(q) {
    dialog({ title: "Notice", html: "<p>Would you like to mark this quest as done without adding to your savings?</p>" + qDialogInfo(q),
      buttons: [{ label: "No", cls: "ghost" }, { label: "Yes", fn: function () { finishQuest(q, false); } }] });
  }
  function finishQuest(q, add) {
    if (state.quests[q.id] && state.quests[q.id].done) return;
    var now = new Date(), streakNew = false;
    state.quests[q.id] = { done: true, added: !!add, ts: now.getTime() };
    if (add) {
      if (q.p) state.total += q.p; else state.fates += q.f;
      state.history.push({ id: now.getTime() + "-" + state.history.length, ts: now.getTime(), amount: q.p || q.f, type: "add", cur: q.p ? "p" : "f", note: "Quest: " + q.t + " (" + rewardText(q) + ")" });
      streakNew = bumpStreak(now);
    }
    save();
    var w = document.querySelector('#questRoot .qwrap[data-id="' + q.id + '"]');
    var after = function () { renderQuests(); renderDash(); toast(add ? "Quest done. Added " + gainText(q) + " to your savings" : "Quest marked as done. Savings unchanged"); if (streakNew) showStreakSaved(); };
    if (w && !prefersReduced) { w.classList.add("leaving"); setTimeout(after, 260); } else after();
  }
  (function () {
    var qr = $("questRoot"), drag = null, justSwiped = false;
    function qOf(el) { var w = el.closest ? el.closest(".qwrap") : null; return w ? questById(w.getAttribute("data-id")) : null; }
    qr.addEventListener("click", function (e) {
      if (justSwiped) return;
      var b = e.target.closest ? e.target.closest(".quest") : null; if (!b || b.classList.contains("isdone")) return;
      var q = qOf(b); if (q) tapQuest(q);
    });
    qr.addEventListener("pointerdown", function (e) {
      var b = e.target.closest ? e.target.closest(".quest") : null; if (!b || b.classList.contains("isdone")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { b: b, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, on: false };
    });
    qr.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4) { drag.on = true; try { drag.b.setPointerCapture(e.pointerId); } catch (x) {} drag.b.classList.add("dragging"); }
        else if (Math.abs(dy) > 10) { drag = null; return; }
        else return;
      }
      drag.dx = Math.max(-140, Math.min(0, dx));
      drag.b.style.transform = "translateX(" + drag.dx + "px)";
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.on) return;
      d.b.classList.remove("dragging"); d.b.style.transform = "";
      justSwiped = true; setTimeout(function () { justSwiped = false; }, 80);
      if (d.dx <= -80 && e.type === "pointerup") { var q = qOf(d.b); if (q) swipeQuest(q); }
    }
    qr.addEventListener("pointerup", end); qr.addEventListener("pointercancel", end);
    qr.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft") return;
      var b = e.target.closest ? e.target.closest(".quest") : null; if (!b || b.classList.contains("isdone")) return;
      e.preventDefault(); var q = qOf(b); if (q) swipeQuest(q);
    });
  })();

  /* ---------- Modals / drawer ---------- */
  var openId = null, lastFocus = null, lockedM = false;
  function openM(id, focusEl) {
    if (!openId) lastFocus = document.activeElement;
    openId = id; $(id).hidden = false; document.body.classList.add("mlock");
    var f = typeof focusEl === "string" ? $(focusEl) : focusEl;
    if (f) setTimeout(function () { f.focus(); if (f.select) f.select(); }, 30);
  }
  function closeM() { if (!openId) return; $(openId).hidden = true; openId = null; lockedM = false; document.body.classList.remove("mlock"); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", closeM); });
  var swallowClick = false, swallowT = 0;
  document.querySelectorAll(".overlay").forEach(function (o) { o.addEventListener("pointerdown", function (e) { if (e.target === o) { if (lockedM) { e.preventDefault(); return; } closeM(); swallowClick = true; clearTimeout(swallowT); swallowT = setTimeout(function () { swallowClick = false; }, 450); } }); });
  document.addEventListener("click", function (e) { if (swallowClick) { swallowClick = false; e.preventDefault(); e.stopPropagation(); } }, true);
  function dialog(o) {
    $("dTitle").textContent = o.title;
    var body = $("dBody"); body.innerHTML = o.html || ""; if (o.node) body.appendChild(o.node);
    var row = $("dBtns"); row.innerHTML = "";
    o.buttons.forEach(function (b) {
      var el = document.createElement("button"); el.type = "button"; el.className = "btn " + (b.cls || ""); el.textContent = b.label;
      el.addEventListener("click", function () { var keep = b.fn ? b.fn() === false : false; if (!keep) closeM(); });
      row.appendChild(el);
    });
    openM("mDialog", row.lastChild); lockedM = !!o.lock;
  }
  var drawerFocus = null;
  function openDrawer() { drawerFocus = document.activeElement; $("drawer").hidden = false; setTimeout(function () { $("dProfile").focus(); }, 30); }
  function closeDrawer() { if ($("drawer").hidden) return; $("drawer").hidden = true; if (drawerFocus && drawerFocus.focus) drawerFocus.focus(); }
  $("burger").addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  $("drawerBg").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (lockedM) return; if (openId) closeM(); else closeDrawer(); } });
  var tt = null;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 2600); }

  /* ---------- Routing ---------- */
  var VIEWS = ["welcome", "auth", "dashboard", "navigation", "quest", "calculator", "chara", "history", "profile", "about", "contact"];
  var TABOF = { dashboard: "dashboard", history: "dashboard", navigation: "navigation", quest: "quest", calculator: "calculator", chara: "chara" };
  function route() {
    var h = (location.hash || "").replace("#", ""), view = h;
    if (h === "signin" || h === "signup") { view = "auth"; authMode = h === "signup" ? "up" : "in"; }
    else if (!h) view = seen() ? "dashboard" : "welcome";
    if (VIEWS.indexOf(view) < 0) view = seen() ? "dashboard" : "welcome";
    if (PUBLIC.indexOf(view) < 0 && !user && !guest) { if (authReady) { location.replace(seen() ? "#signin" : "#welcome"); return; } else view = "welcome"; }
    if (view === "auth" && user) { location.replace("#dashboard"); return; }
    if (view !== "welcome" && view !== "auth") setSeen();
    if (view === "auth") renderAuth();
    if (view !== "chara") editing = false;
    document.body.setAttribute("data-view", view);
    VIEWS.forEach(function (v) { $("view-" + v).hidden = v !== view; });
    document.querySelectorAll(".tab[data-go]").forEach(function (b) {
      if (b.getAttribute("data-go") === TABOF[view]) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    closeDrawer();
    sky(); renderTop();
    if (view === "dashboard") { renderDash(); maybeRemind(); }
    if (view === "history") { renderHistory(); resetAskMode(false); }
    if (view === "quest") renderQuests();
    if (view === "chara") { buildChips(); renderChara(); }
    if (view === "profile") renderProfile();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ---------- Accounts (Firebase, with an on-device preview when Firebase is not connected) ---------- */
  /* Paste your Firebase web app config here (Firebase console > Project settings > Your apps). */
  var FIREBASE_CONFIG = {apiKey:"AIzaSyBTbl61p-__lNkT-0MLcuXNZOVRGq139rg",authDomain:"astrawish.firebaseapp.com",projectId:"astrawish",appId:"1:810480017263:web:18916d22684368599e929a"};
  var FB_VER = "10.14.1", FB_BASE = "https://cdn.jsdelivr.net/npm/firebase@" + FB_VER + "/";
  var PUBLIC = ["welcome", "auth", "about", "contact"];
  var user = null, guest = false, authReady = false, authMode = "in", fbOn = !!FIREBASE_CONFIG.apiKey, fbAuth = null, busy = false;
  var GUEST = "astrawish.guest.v1", ACC = "astrawish.acc.v1", SESS = "astrawish.sess.v1", memAcc = {}, memSess = null, guestMem = false;
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function accounts() { try { var o = JSON.parse(lsGet(ACC, "")); if (o && typeof o === "object") return o; } catch (e) {} return memAcc; }
  function putAccounts(o) { memAcc = o; lsSet(ACC, JSON.stringify(o)); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hashPw(email, pw) {
    if (!(window.crypto && crypto.subtle && window.TextEncoder)) return Promise.resolve("p:" + btoa(unescape(encodeURIComponent(email + "|" + pw))));
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode("astrawish:" + email), iterations: 100000, hash: "SHA-256" }, k, 256);
    }).then(hex);
  }
  function uidOf(email) { var h = 5381; for (var i = 0; i < email.length; i++) h = ((h << 5) + h + email.charCodeAt(i)) | 0; return "l" + (h >>> 0).toString(36); }
  function AuthErr(code, msg) { var e = new Error(msg); e.code = code; return e; }
  var FBMSG = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-not-found": "No account uses that email. Check it or sign up.",
    "auth/wrong-password": "That password is incorrect.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-login-credentials": "The email or password is incorrect.",
    "auth/email-already-in-use": "An account with that email already exists. Sign in instead.",
    "auth/weak-password": "Choose a password with at least 8 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/network-request-failed": "Couldn't reach Firebase. Check your connection and try again.",
    "auth/popup-closed-by-user": "The Google window was closed before finishing.",
    "auth/cancelled-popup-request": "The Google window was closed before finishing.",
    "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups and try again.",
    "auth/unauthorized-domain": "This site's address isn't allowed in Firebase yet. Add it under Authentication > Settings > Authorized domains.",
    "auth/operation-not-allowed": "This sign-in method isn't turned on in Firebase yet.",
    "auth/user-disabled": "This account has been disabled."
  };
  function errText(e) { return (e && (FBMSG[e.code] || (e.code && e.code.indexOf("auth/") === 0 ? "Something went wrong (" + e.code + "). Try again." : e.message))) || "Something went wrong. Try again."; }
  function fbUser(u) { return u ? { uid: u.uid, email: u.email || "", name: u.displayName || "", provider: u.providerData && u.providerData[0] && u.providerData[0].providerId === "google.com" ? "google" : "email" } : null; }
  var AuthAPI = {
    signUp: function (name, email, pw) {
      if (fbOn) return fbAuth.createUserWithEmailAndPassword(email, pw).then(function (c) { return c.user.updateProfile({ displayName: name }).then(function () { return fbUser(c.user); }); });
      var acc = accounts(); if (acc[email]) return Promise.reject(AuthErr("auth/email-already-in-use"));
      return hashPw(email, pw).then(function (h) { acc[email] = { h: h, name: name }; putAccounts(acc); return { uid: uidOf(email), email: email, name: name, provider: "email" }; });
    },
    signIn: function (email, pw) {
      if (fbOn) return fbAuth.signInWithEmailAndPassword(email, pw).then(function (c) { return fbUser(c.user); });
      var acc = accounts(), a = acc[email]; if (!a) return Promise.reject(AuthErr("auth/user-not-found"));
      return hashPw(email, pw).then(function (h) { if (h !== a.h) throw AuthErr("auth/wrong-password"); return { uid: uidOf(email), email: email, name: a.name || "", provider: "email" }; });
    },
    google: function () {
      if (!fbOn) return Promise.reject(AuthErr("preview", "Google sign-in turns on once Firebase is connected."));
      var pr = new firebase.auth.GoogleAuthProvider(); pr.setCustomParameters({ prompt: "select_account" });
      return fbAuth.signInWithPopup(pr).then(function (c) { return fbUser(c.user); });
    },
    reset: function (email) {
      if (fbOn) return fbAuth.sendPasswordResetEmail(email);
      return Promise.reject(AuthErr("preview", "Password reset emails turn on once Firebase is connected."));
    },
    out: function () { if (fbOn) return fbAuth.signOut(); lsDel(SESS); memSess = null; return Promise.resolve(); }
  };
  function applyUser(u, remember) {
    var changed = (u ? u.uid : null) !== (user ? user.uid : null);
    var oldKey = curKey, wasUser = !!user;
    if (changed) stopCloud();
    user = u;
    if (u && !fbOn && remember) { memSess = u.email; lsSet(SESS, u.email); }
    curKey = u ? KEY + ".u." + u.uid : KEY;
    if (changed && wasUser && !u && fbDb) { try { localStorage.removeItem(oldKey); } catch (e) {} }
    if (changed) {
      state = load();
      if (u && u.name && (!state.name || state.name === "Traveler")) { state.name = u.name; writeLocal(); }
      else if (u && !state.name) { state.name = (u.email || "Traveler").split("@")[0]; writeLocal(); }
    }
    renderTop();
  }
  function setGuest(v) { guest = v; guestMem = v; if (v) lsSet(GUEST, "1"); else lsDel(GUEST); }
  function afterAuth() { authReady = true; route(); }
  function loadFirebase() {
    return new Promise(function (res, rej) {
      function add(src, cb, soft) { var s = document.createElement("script"); s.src = src; s.onload = cb; s.onerror = function () { if (soft) cb(); else rej(new Error("load")); }; document.head.appendChild(s); }
      add(FB_BASE + "firebase-app-compat.js", function () { add(FB_BASE + "firebase-auth-compat.js", function () { add(FB_BASE + "firebase-firestore-compat.js", res, true); }); });
    });
  }
  function initAuth() {
    guest = lsGet(GUEST, "") === "1" || guestMem;
    if (!fbOn) {
      var em = lsGet(SESS, memSess || ""), a = em && accounts()[em];
      if (a) applyUser({ uid: uidOf(em), email: em, name: a.name || "", provider: "email" }, false);
      afterAuth(); return;
    }
    var done = false, timer = setTimeout(function () { if (!done) { done = true; fbOn = false; afterAuth(); } }, 9000);
    loadFirebase().then(function () {
      firebase.initializeApp(FIREBASE_CONFIG); fbAuth = firebase.auth();
      try { if (firebase.firestore) fbDb = firebase.firestore(); } catch (e) { fbDb = null; }
      fbAuth.onAuthStateChanged(function (u) {
        applyUser(fbUser(u), false);
        if (u) startCloud(); else { cloudSettled = true; }
        if (!done) { done = true; clearTimeout(timer); }
        afterAuth();
      });
    }).catch(function () { if (!done) { done = true; clearTimeout(timer); fbOn = false; afterAuth(); } });
  }

  /* ---------- Cloud sync (Firestore: users/{uid} = { v, ts, json }) ---------- */
  function hasData(s) { return !!s && (s.total > 0 || s.fates > 0 || s.history.length > 0 || s.owned.length > 0 || Object.keys(s.quests).length > 0 || !!(s.streak && s.streak.last) || s.goal !== DEFAULT_GOAL); }
  function cloudDoc() { return fbDb.collection("users").doc(user.uid); }
  function cloudFail() { if (!cloudWarned) { cloudWarned = true; toast("Cloud sync isn't available right now. Your data is saved on this device."); } }
  function queuePush() { if (!user || !fbDb || !cloudReady) return; clearTimeout(pushT); pushT = setTimeout(pushNow, 900); }
  function pushNow() {
    clearTimeout(pushT); pushT = null;
    if (!user || !fbDb || !cloudReady) return Promise.resolve();
    var s = state;
    return cloudDoc().set({ v: 1, ts: s.ts || Date.now(), json: JSON.stringify(s) }).catch(cloudFail);
  }
  function flushCloud() {
    if (!pushT) return Promise.resolve();
    return Promise.race([pushNow(), new Promise(function (r) { setTimeout(r, 2500); })]);
  }
  function refreshAll() {
    renderTop(); var v = document.body.getAttribute("data-view");
    if (v === "dashboard") renderDash(); else if (v === "history") renderHistory(); else if (v === "quest") renderQuests();
    else if (v === "chara") { buildChips(); renderChara(); } else if (v === "profile") renderProfile();
  }
  function adopt(c) { state = normalize(c); writeLocal(); refreshAll(); }
  function stopCloud() { if (cloudUnsub) { try { cloudUnsub(); } catch (e) {} cloudUnsub = null; } clearTimeout(pushT); pushT = null; cloudReady = false; cloudSettled = false; }
  function listenCloud() {
    if (cloudUnsub) return;
    cloudUnsub = cloudDoc().onSnapshot(function (snap) {
      if (!snap.exists || snap.metadata.hasPendingWrites) return;
      try { var d = snap.data(); if ((d.ts || 0) <= (state.ts || 0)) return; var c = JSON.parse(d.json); c.ts = d.ts; adopt(c); } catch (e) {}
    }, function () {});
  }
  function startCloud() {
    if (!user || !fbDb) { cloudSettled = true; return; }
    var uid = user.uid; cloudReady = false; cloudSettled = false;
    cloudDoc().get().then(function (snap) {
      if (!user || user.uid !== uid) return;
      var cloud = null, needPush = true;
      if (snap.exists) { try { var d = snap.data(); cloud = JSON.parse(d.json); cloud.ts = d.ts; } catch (e) { cloud = null; } }
      if (cloud && typeof cloud === "object" && (!hasData(state) || (cloud.ts || 0) >= (state.ts || 0))) { adopt(cloud); needPush = false; }
      cloudReady = true; cloudSettled = true;
      if (needPush) pushNow();
      listenCloud(); maybeRemind();
    }).catch(function () { cloudFail(); cloudReady = false; cloudSettled = true; maybeRemind(); });
  }
  window.addEventListener("online", function () { if (!user || !fbDb) return; if (!cloudReady) startCloud(); else pushNow(); });
  window.addEventListener("pagehide", function () { if (pushT) pushNow(); });

  /* ---------- Sign in / Sign up screen ---------- */
  function setAuthMsg(err, ok) { $("aErr").textContent = err || ""; $("aOk").textContent = ok || ""; }
  function renderAuth() {
    var up = authMode === "up";
    $("tabIn").setAttribute("aria-pressed", !up); $("tabUp").setAttribute("aria-pressed", up);
    $("authTitle").textContent = up ? "Create your account" : "Welcome back";
    $("authSub").textContent = up ? "Save your savings and characters to your own account." : "Sign in to open your savings.";
    $("fName").hidden = !up; $("fPass2").hidden = !up; $("aForgot").hidden = up;
    $("aSubmit").textContent = up ? "Create account" : "Sign in";
    $("aPass").autocomplete = up ? "new-password" : "current-password";
    $("aSwitch").innerHTML = up ? 'Already have an account? <a href="#signin">Sign in</a>' : 'New here? <a href="#signup">Create an account</a>';
    var n = $("authMode");
    n.hidden = fbOn;
    n.textContent = fbOn ? "" : "Firebase isn't connected to this copy of AstraWish yet. Accounts you create here are kept on this device only, and Google sign-in and password reset are off.";
    $("aGoogle").disabled = !fbOn;
    setAuthMsg("", "");
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  $("tabIn").addEventListener("click", function () { location.hash = "signin"; });
  $("tabUp").addEventListener("click", function () { location.hash = "signup"; });
  $("aShow").addEventListener("click", function () {
    var show = $("aPass").type === "password"; $("aPass").type = show ? "text" : "password"; $("aPass2").type = show ? "text" : "password";
    $("aShow").textContent = show ? "Hide" : "Show"; $("aShow").setAttribute("aria-pressed", show);
  });
  function setBusy(b) { busy = b; $("aSubmit").disabled = b; $("aGoogle").disabled = b || !fbOn; }
  function finishAuth(u) { setGuest(false); applyUser(u, true); setBusy(false); $("aPass").value = ""; $("aPass2").value = ""; toast(authMode === "up" ? "Account created. Welcome, " + (u.name || "Traveler") + "!" : "Signed in"); location.hash = "dashboard"; }
  $("authForm").addEventListener("submit", function (e) {
    e.preventDefault(); if (busy) return;
    var up = authMode === "up", name = $("aName").value.trim(), email = $("aEmail").value.trim().toLowerCase(), pw = $("aPass").value;
    if (up && !name) { setAuthMsg("Enter a display name."); return; }
    if (!email) { setAuthMsg("Enter your email."); return; }
    if (!validEmail(email)) { setAuthMsg("That email address doesn't look right."); return; }
    if (!pw) { setAuthMsg("Enter your password."); return; }
    if (up && pw.length < 8) { setAuthMsg("Use at least 8 characters for your password."); return; }
    if (up && pw !== $("aPass2").value) { setAuthMsg("The two passwords don't match."); return; }
    setAuthMsg("", ""); setBusy(true);
    (up ? AuthAPI.signUp(name, email, pw) : AuthAPI.signIn(email, pw)).then(finishAuth).catch(function (er) { setBusy(false); setAuthMsg(errText(er)); });
  });
  $("aGoogle").addEventListener("click", function () {
    if (busy) return; setAuthMsg("", ""); setBusy(true);
    AuthAPI.google().then(finishAuth).catch(function (er) { setBusy(false); setAuthMsg(errText(er)); });
  });
  $("aForgot").addEventListener("click", function () {
    var email = $("aEmail").value.trim().toLowerCase();
    if (!validEmail(email)) { setAuthMsg("Enter your email above, then tap Forgot password."); return; }
    setAuthMsg("", ""); AuthAPI.reset(email).then(function () { setAuthMsg("", "If an account uses " + email + ", a reset link is on its way."); }).catch(function (er) { setAuthMsg(errText(er)); });
  });
  function goGuest() { setGuest(true); location.hash = "dashboard"; }
  $("guestBtn").addEventListener("click", goGuest); $("guestBtn2").addEventListener("click", goGuest);
  function signOutNow() { flushCloud().then(function () { return AuthAPI.out(); }).then(function () { applyUser(null, false); closeDrawer(); toast("Signed out"); location.hash = "signin"; route(); }); }
  function signBtn() { if (user) signOutNow(); else { setGuest(false); location.hash = "signin"; } }
  $("pSign").addEventListener("click", signBtn); $("dSign").addEventListener("click", signBtn);

  document.querySelectorAll(".tab[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { var g = b.getAttribute("data-go"); if (location.hash === "#" + g) route(); else location.hash = g; });
  });
  $("learnBtn").addEventListener("click", function () { $("whatSection").scrollIntoView({ behavior: "smooth", block: "start" }); });

  /* ---------- Add / subtract ---------- */
  var mode = "add", cur = "p";
  function setCur(c) { cur = c; $("curP").setAttribute("aria-pressed", c === "p"); $("curF").setAttribute("aria-pressed", c === "f"); $("amtIco").src = "assets/" + (c === "p" ? "primoGems" : "fates") + ".png"; $("amtLbl").textContent = c === "p" ? "Primogem amount" : "Intertwined Fate amount"; $("amtInput").placeholder = "Enter amount"; }
  $("curP").addEventListener("click", function () { setCur("p"); });
  $("curF").addEventListener("click", function () { setCur("f"); });
  $("fateBtn").addEventListener("click", function () { setMode("add"); setCur("f"); $("amtInput").value = ""; $("amtErr").textContent = ""; openM("mAmount", "amtInput"); });
  function setMode(m) { mode = m; $("modeAdd").setAttribute("aria-pressed", m === "add"); $("modeSub").setAttribute("aria-pressed", m === "sub"); $("amtOk").textContent = m === "add" ? "Add to savings" : "Subtract"; }
  $("modeAdd").addEventListener("click", function () { setMode("add"); });
  $("modeSub").addEventListener("click", function () { setMode("sub"); });
  $("addBtn").addEventListener("click", function () { setMode("add"); setCur("p"); $("amtInput").value = ""; $("amtErr").textContent = ""; openM("mAmount", "amtInput"); });
  $("amountForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var p = parseInt0($("amtInput").value), err = $("amtErr");
    if (p.empty) { err.textContent = cur === "p" ? "Enter a Primogem amount." : "Enter an Intertwined Fate amount."; return; }
    if (p.bad) { err.textContent = "Use whole numbers only, with no minus sign or decimals."; return; }
    if (p.v < 1) { err.textContent = "The amount must be at least 1."; return; }
    if (p.v > (cur === "p" ? 9999999 : 99999)) { err.textContent = "That amount is too large. Enter " + (cur === "p" ? "9,999,999" : "99,999") + " or less."; return; }
    var have = cur === "p" ? state.total : state.fates;
    if (mode === "sub" && p.v > have) { err.textContent = "You only have " + fmt(have) + " saved, so you can't subtract " + fmt(p.v) + "."; return; }
    var now = new Date(), streakNew = false;
    if (cur === "p") state.total += mode === "add" ? p.v : -p.v; else state.fates += mode === "add" ? p.v : -p.v;
    state.history.push({ id: now.getTime() + "-" + state.history.length, ts: now.getTime(), amount: p.v, type: mode, cur: cur, note: "" });
    if (mode === "add") {
      streakNew = bumpStreak(now);
    }
    save(); closeM(); renderDash();
    if (streakNew) setTimeout(showStreakSaved, 250);
    var unit = cur === "p" ? " Primogems" : (p.v === 1 ? " Intertwined Fate" : " Intertwined Fates");
    toast(mode === "add" ? "Added " + fmt(p.v) + unit : "Subtracted " + fmt(p.v) + unit);
  });

  /* ---------- Draw Now ---------- */
  var PG = '<img src="assets/primoGems.png" alt="">';
  var FG = '<img src="assets/fates.png" alt="">';
  function holdHtml(amt, f) { return '<div class="big">' + PG + fmt(amt) + "</div>" + (f > 0 ? '<div class="big">' + FG + fmt(f) + "</div>" : ""); }
  $("drawBtn").addEventListener("click", function () {
    var amt = state.total, f = state.fates, w = Math.floor(amt / WISH) + f;
    if (w < 1) {
      dialog({ title: "Unable to draw", html: "<p>You don't have enough savings to draw. A single wish costs <b>160 Primogems</b> or <b>1 Intertwined Fate</b>.</p>" + holdHtml(amt, f) + "<p>Keep saving, Traveler. You are " + fmt(WISH - amt) + " Primogems away from your first wish.</p>", buttons: [{ label: "OK" }] });
      return;
    }
    dialog({ title: "Are you sure?", html: "<p>Do you want to pull with all of your savings?</p>" + holdHtml(amt, f) + "<p>That is <b>" + fmt(w) + (w === 1 ? " wish" : " wishes") + "</b>. Your savings, Intertwined Fates and saving goal will be reset after you draw.</p>",
      buttons: [{ label: "No", cls: "ghost" }, { label: "Yes", fn: function () {
        var now = new Date();
        if (amt > 0) state.history.push({ id: now.getTime() + "-" + state.history.length, ts: now.getTime(), amount: amt, type: "sub", cur: "p", note: "Draw Now" });
        if (f > 0) state.history.push({ id: now.getTime() + "-f" + state.history.length, ts: now.getTime(), amount: f, type: "sub", cur: "f", note: "Draw Now" });
        state.total = 0; state.fates = 0; state.goal = DEFAULT_GOAL; save(); renderDash();
        dialog({ title: "Congratulations!", html: "<p>Congratulations for reaching</p>" + holdHtml(amt, f) + "<p>Your savings are back to 0 and your saving goal has been cleared. Pick your next dream character whenever you are ready.</p>", buttons: [{ label: "Done" }] });
        return false;
      } }] });
  });

  /* ---------- Goal ---------- */
  $("goalEdit").addEventListener("click", function () {
    dialog({ title: "Pick your saving goal", html: "<p>To set a saving goal, go to Chara, tap the character you want, then choose \u201CSet as Saving Goal\u201D.</p>", buttons: [
      { label: "Close", cls: "ghost" },
      { label: "Go to Chara", fn: function () { location.hash = "chara"; } }
    ] });
  });

  /* ---------- Calculator ---------- */
  $("useSaved").addEventListener("click", function () { $("calcPrimo").value = state.total; });
  $("calcForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("calcErr"), out = $("calcOut");
    var a = parseInt0($("calcPrimo").value), b = parseInt0($("calcFates").value);
    err.textContent = ""; out.hidden = true;
    if (a.empty && b.empty) { err.textContent = "Enter your Primogems, your Intertwined Fates, or both."; return; }
    if (a.bad || b.bad) { err.textContent = "Use whole numbers only. Negative numbers and decimals aren't allowed."; return; }
    var primo = a.empty ? 0 : a.v, fates = b.empty ? 0 : b.v;
    if (primo > 99999999 || fates > 999999) { err.textContent = "One of those numbers is too large. Check it and try again."; return; }
    var pw = Math.floor(primo / WISH), ex = primo % WISH, total = pw + fates;
    $("rP").textContent = fmt(pw); $("rF").textContent = fmt(fates);
    $("rT").textContent = fmt(total) + (total === 1 ? " Wish" : " Wishes");
    $("rE").textContent = fmt(ex) + " Primogems";
    $("rNote").textContent = ex === 0 ? "No Primogems are left over." : fmt(ex) + " Primogems remain unused because they are below the 160 needed for another wish.";
    out.hidden = false;
  });

  /* ---------- Profile / contact / reset ---------- */
  $("nameForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("nameInput").value.trim();
    if (!v) { $("nameErr").textContent = "Enter a display name."; return; }
    state.name = v; save(); renderProfile(); toast("Display name saved");
  });
  document.querySelectorAll(".devmail").forEach(function (c) { c.textContent = DEV_EMAIL; });
  document.querySelectorAll(".mailto").forEach(function (a) { a.href = "mailto:" + DEV_EMAIL; });
  document.querySelectorAll(".copymail").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () { toast("Email copied"); };
      try { navigator.clipboard.writeText(DEV_EMAIL).then(done, function () { toast("Select the email and copy it"); }); } catch (e) { toast("Select the email and copy it"); }
    });
  });
  function resetAskMode(c) { $("resetAsk").hidden = c; $("resetConfirm").hidden = !c; }
  $("resetBtn").addEventListener("click", function () { resetAskMode(true); });
  $("resetNo").addEventListener("click", function () { resetAskMode(false); });
  $("resetYes").addEventListener("click", function () { state = fresh(); save(); resetAskMode(false); renderHistory(); renderDash(); toast("All data reset"); });

  buildNav(); buildChips();
  setInterval(sky, 60000);
  route();
  initAuth();
})();
