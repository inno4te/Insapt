/* ============================================================
   INSAPT Academy — moteur de la plateforme e-learning
   Auth apprenant (nom + section) · progression synchronisée
   Google Sheets · examens QCM chronométrés · certificats PDF
   signés du DG · console admin (forteh / f0rteh).
   ============================================================ */
(function () {
  "use strict";

  // ---- Google Apps Script endpoint (same Web App as SCM) ----
  const GS_URL = "https://script.google.com/macros/s/AKfycbyZr2pxJS1mBqLRQv9Oli5jbbenmD-HHj6AvL_GH49Qp1XAHimIBitIdOUUqxDFyZaKFw/exec";
  const GS_KEY = "INSAPT-SCM-KEY";
  const ADMIN = { user: "forteh", pass: "f0rteh" };

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  // ---------- i18n (UI chrome) ----------
  const T = {
    fr: {
      "login.title": "INSAPT Academy — Passation des Marchés", "login.sub": "Plateforme de formation et de certification du personnel",
      "login.note": "Entrez votre nom exactement tel qu'il doit figurer sur vos certificats. Votre progression est sauvegardée en ligne : vous pouvez continuer depuis n'importe quel ordinateur ou téléphone.",
      "login.name": "Nom complet (pour le certificat)", "login.section": "Section / Service",
      "login.go": "Commencer / Continuer ma formation", "login.back": "← Site INSAPT", "login.scm": "Portail SCM", "login.admin": "Accès administrateur",
      "app.brand": "INSAPT Academy", "app.sub": "Formation en Passation des Marchés",
      "nav.site": "Site INSAPT", "nav.scm": "Portail SCM", "nav.courses": "Mes cours", "nav.logout": "Quitter",
      "dash.hello": "Bienvenue", "dash.overall": "de l'ensemble du programme complété",
      "dash.p": "Sept parcours pour bâtir vos compétences en passation des marchés — des principes généraux à la certification Expert Niveau 4. Chaque parcours se conclut par un examen QCM chronométré ; un score de 75 % délivre un certificat officiel signé du Directeur Général.",
      "course.modules": "Modules", "course.markdone": "Marquer comme terminé →", "course.open": "Ouvrir", "course.continue": "Continuer", "course.exam": "Passer l'examen", "course.locked": "Verrouillé — validez les Niveaux 1 à 3", "course.certified": "Certifié", "course.getcert": "Télécharger le certificat",
      "exam.submit": "Soumettre mes réponses", "exam.cancel": "Abandonner", "exam.note": "Seuil de réussite : 75 %. Le temps écoulé soumet automatiquement.",
      "admin.title": "Console d'administration", "admin.exit": "Quitter l'admin", "admin.settings": "Paramètres des certificats",
      "admin.signer": "Nom du signataire", "admin.signerTitle": "Titre du signataire", "admin.passmark": "Seuil de réussite (%)", "admin.save": "Enregistrer les paramètres",
      "admin.note": "Les paramètres sont stockés dans Google Sheets et s'appliquent à tous les apprenants.",
      modOf: (i, n) => `Module ${i} / ${n}`, qOf: n => `${n} questions`, minutes: m => `${m} min`,
      pass: "RÉUSSI", fail: "ÉCHOUÉ", yourScore: "Votre score", retry: "Réessayer l'examen", backCourse: "Retour au cours",
      certReady: "Félicitations ! Votre certificat est prêt.", download: "Télécharger le certificat (PDF)",
      mustFinish: "Terminez tous les modules avant de passer l'examen.", saved: "Progression enregistrée", synced: "Synchronisé avec Google",
      offline: "Hors ligne — progression locale uniquement", welcomeBack: "Content de vous revoir"
    },
    en: {
      "login.title": "INSAPT Academy — Procurement Training", "login.sub": "Staff training & certification platform",
      "login.note": "Enter your name exactly as it should appear on your certificates. Your progress is saved online: continue from any computer or phone.",
      "login.name": "Full name (for the certificate)", "login.section": "Section / Department",
      "login.go": "Start / Continue my training", "login.back": "← INSAPT website", "login.scm": "SCM Portal", "login.admin": "Administrator access",
      "app.brand": "INSAPT Academy", "app.sub": "Procurement Training",
      "nav.site": "INSAPT website", "nav.scm": "SCM Portal", "nav.courses": "My courses", "nav.logout": "Sign out",
      "dash.hello": "Welcome", "dash.overall": "of the full programme completed",
      "dash.p": "Seven learning tracks to build your procurement skills — from general principles to the Level 4 Expert certification. Each track ends with a timed MCQ exam; a 75% score earns an official certificate signed by the Director General.",
      "course.modules": "Modules", "course.markdone": "Mark as complete →", "course.open": "Open", "course.continue": "Continue", "course.exam": "Take the exam", "course.locked": "Locked — complete Levels 1-3", "course.certified": "Certified", "course.getcert": "Download certificate",
      "exam.submit": "Submit my answers", "exam.cancel": "Abandon", "exam.note": "Pass mark: 75%. Time expiry auto-submits.",
      "admin.title": "Administration console", "admin.exit": "Exit admin", "admin.settings": "Certificate settings",
      "admin.signer": "Signatory name", "admin.signerTitle": "Signatory title", "admin.passmark": "Pass mark (%)", "admin.save": "Save settings",
      "admin.note": "Settings are stored in Google Sheets and apply to all learners.",
      modOf: (i, n) => `Module ${i} / ${n}`, qOf: n => `${n} questions`, minutes: m => `${m} min`,
      pass: "PASSED", fail: "FAILED", yourScore: "Your score", retry: "Retry the exam", backCourse: "Back to course",
      certReady: "Congratulations! Your certificate is ready.", download: "Download certificate (PDF)",
      mustFinish: "Complete all modules before taking the exam.", saved: "Progress saved", synced: "Synced with Google",
      offline: "Offline — local progress only", welcomeBack: "Welcome back"
    },
    ar: {
      "login.title": "أكاديمية المعهد — تدريب المشتريات", "login.sub": "منصة تدريب واعتماد الموظفين",
      "login.note": "أدخل اسمك كما تريد ظهوره على شهاداتك. يُحفظ تقدمك عبر الإنترنت ويمكنك المتابعة من أي جهاز.",
      "login.name": "الاسم الكامل (للشهادة)", "login.section": "القسم / المصلحة",
      "login.go": "ابدأ / تابع تدريبي", "login.back": "← موقع المعهد", "login.scm": "بوابة سلسلة الإمداد", "login.admin": "دخول المسؤول",
      "app.brand": "أكاديمية المعهد", "app.sub": "تدريب المشتريات",
      "nav.site": "موقع المعهد", "nav.scm": "بوابة سلسلة الإمداد", "nav.courses": "دوراتي", "nav.logout": "خروج",
      "dash.hello": "مرحباً", "dash.overall": "من البرنامج الكامل مُنجَز",
      "dash.p": "سبعة مسارات لبناء مهاراتك في المشتريات — من المبادئ العامة إلى شهادة الخبير (المستوى الرابع). كل مسار ينتهي بامتحان اختيار من متعدد محدد بوقت؛ نتيجة ٧٥٪ تمنح شهادة رسمية موقعة من المدير العام.",
      "course.modules": "الوحدات", "course.markdone": "وضع علامة مكتمل ←", "course.open": "فتح", "course.continue": "متابعة", "course.exam": "دخول الامتحان", "course.locked": "مقفل — أكمل المستويات ١–٣", "course.certified": "معتمد", "course.getcert": "تحميل الشهادة",
      "exam.submit": "إرسال إجاباتي", "exam.cancel": "انسحاب", "exam.note": "عتبة النجاح: ٧٥٪. انتهاء الوقت يُرسل تلقائياً.",
      "admin.title": "لوحة الإدارة", "admin.exit": "خروج من الإدارة", "admin.settings": "إعدادات الشهادات",
      "admin.signer": "اسم الموقّع", "admin.signerTitle": "صفة الموقّع", "admin.passmark": "عتبة النجاح (٪)", "admin.save": "حفظ الإعدادات",
      "admin.note": "تُخزَّن الإعدادات في Google Sheets وتنطبق على جميع المتعلمين.",
      modOf: (i, n) => `الوحدة ${i} / ${n}`, qOf: n => `${n} سؤالاً`, minutes: m => `${m} دقيقة`,
      pass: "ناجح", fail: "راسب", yourScore: "نتيجتك", retry: "إعادة الامتحان", backCourse: "العودة إلى الدورة",
      certReady: "تهانينا! شهادتك جاهزة.", download: "تحميل الشهادة (PDF)",
      mustFinish: "أكمل جميع الوحدات قبل دخول الامتحان.", saved: "تم حفظ التقدم", synced: "متزامن مع Google",
      offline: "دون اتصال — التقدم محلي فقط", welcomeBack: "سعيدون بعودتك"
    }
  };
  let LANG = localStorage.getItem("insapt.el.lang") || "fr";
  window.EL_LANG = LANG;
  const t = k => { const v = T[LANG][k]; return v != null ? v : (T.fr[k] || k); };

  function applyLang(l) {
    LANG = l; window.EL_LANG = l;
    localStorage.setItem("insapt.el.lang", l);
    document.documentElement.lang = l;
    document.body.dir = (l === "ar") ? "rtl" : "ltr";
    $$("[data-el]").forEach(el => { const k = el.getAttribute("data-el"); const v = t(k); if (typeof v === "string") el.textContent = v; });
    $$(".lang-mini button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    if (state.learner && $("#app").classList.contains("on")) { renderDash(); }
  }

  // ---------- State ----------
  const LS = "insapt.el.";
  let state = {
    learner: null,      // {id, name, section}
    progress: null,     // {done:{courseId:[idx...]}, certs:{courseId:{score,date}}, cur:{}}
    settings: { signer: "Pr Ali Mahamat Moussa", signerTitle: "Directeur Général, INSAPT", pass: 75 },
    online: false, admin: false
  };
  let examCtx = null; // {course, questions, deadline, timerId}

  function blankProgress() { return { done: {}, certs: {}, cur: {} }; }
  function toast(msg, kind) { const el = $("#toast"); el.textContent = msg; el.className = "toast show " + (kind || ""); clearTimeout(el._t); el._t = setTimeout(() => el.className = "toast", 2800); }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Google sync ----------
  async function gsGet(params) {
    const u = GS_URL + "?" + new URLSearchParams(Object.assign({ key: GS_KEY }, params));
    const r = await fetch(u); return r.json();
  }
  async function gsPost(body) {
    const r = await fetch(GS_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ key: GS_KEY }, body)) });
    return r.json();
  }
  async function loginLearner(name, section) {
    try {
      const j = await gsPost({ action: "el_login", name, section });
      if (j && j.ok) {
        state.online = true;
        state.learner = { id: j.id, name: j.name, section: j.section };
        state.progress = j.progress ? JSON.parse(j.progress) : blankProgress();
        if (j.settings) applySettings(j.settings);
        return true;
      }
    } catch (e) { /* offline path below */ }
    state.online = false;
    state.learner = { id: "local-" + name.toLowerCase().replace(/\s+/g, "-"), name, section };
    const cached = localStorage.getItem(LS + "prog." + state.learner.id);
    state.progress = cached ? JSON.parse(cached) : blankProgress();
    return true;
  }
  function applySettings(s) {
    if (s.signer) state.settings.signer = s.signer;
    if (s.signerTitle) state.settings.signerTitle = s.signerTitle;
    if (s.pass) state.settings.pass = parseInt(s.pass) || 75;
  }
  let saveTimer = null;
  function saveProgress() {
    localStorage.setItem(LS + "prog." + state.learner.id, JSON.stringify(state.progress));
    localStorage.setItem(LS + "last", JSON.stringify(state.learner));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      if (!state.online) return;
      try { await gsPost({ action: "el_save", id: state.learner.id, name: state.learner.name, section: state.learner.section, progress: JSON.stringify(state.progress) }); }
      catch (e) { /* keep local */ }
    }, 800);
  }

  // ---------- Course helpers ----------
  const C = () => window.EL_COURSES || [];
  function modulesOf(c) { return window.elBuildModules(c); }
  function doneSet(cid) { return new Set((state.progress.done[cid] || [])); }
  function isCourseComplete(cid) { const c = C().find(x => x.id === cid); return doneSet(cid).size >= modulesOf(c).length; }
  function isCertified(cid) { return !!(state.progress.certs && state.progress.certs[cid]); }
  function isLocked(c) { return (c.requires || []).some(r => !isCertified(r)); }
  function overallPct() {
    let tot = 0, done = 0;
    C().forEach(c => { const n = modulesOf(c).length + 1; tot += n; done += Math.min(doneSet(c.id).size, n - 1) + (isCertified(c.id) ? 1 : 0); });
    return tot ? Math.round(done / tot * 100) : 0;
  }

  // ---------- Views ----------
  function show(id) { ["v-dash", "v-course", "v-exam", "v-admin"].forEach(v => $("#" + v).style.display = (v === id) ? "" : "none"); window.scrollTo(0, 0); }

  function enterApp() {
    $("#loginWrap").style.display = "none";
    $("#app").classList.add("on");
    $("#whoChip").textContent = state.learner.name + " · " + state.learner.section;
    $("#helloLine").textContent = t("dash.hello") + ", " + state.learner.name;
    renderDash(); show("v-dash");
  }

  function renderDash() {
    $("#helloLine").textContent = t("dash.hello") + ", " + (state.learner ? state.learner.name : "");
    const pct = overallPct();
    $("#globalProg").style.width = pct + "%"; $("#globalProgTxt").textContent = pct + "%";
    const g = $("#courseGrid"); g.innerHTML = "";
    C().forEach(c => {
      const mods = modulesOf(c); const dn = doneSet(c.id).size;
      const locked = isLocked(c); const cert = isCertified(c.id);
      const pc = mods.length ? Math.round(dn / mods.length * 100) : 0;
      const card = document.createElement("div");
      card.className = "ccard" + (locked ? " locked" : "");
      card.innerHTML = `
        <div class="band" style="background:${c.color}"></div>
        <div class="body">
          <div class="ic" style="background:${c.color};${c.color === '#FECB00' ? 'color:#031a3d' : ''}">${c.icon}</div>
          <h3>${esc(c.name[LANG] || c.name.fr)}</h3>
          <p>${esc(c.desc[LANG] || c.desc.fr)}</p>
          <div class="meta">
            <span class="pill">${mods.length} modules</span>
            <span class="pill gold">${T[LANG].qOf(c.exam.n)} · ${T[LANG].minutes(c.exam.minutes)}</span>
            ${cert ? `<span class="pill ok">✓ ${t("course.certified")} ${state.progress.certs[c.id].score}%</span>` : ""}
            ${locked ? `<span class="pill lock">🔒 ${t("course.locked")}</span>` : ""}
          </div>
          <div class="cprog"><i style="width:${pc}%"></i></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" data-open="${c.id}" ${locked ? "disabled" : ""}>${dn ? t("course.continue") : t("course.open")}</button>
            ${cert ? `<button class="btn btn-gold btn-sm" data-cert="${c.id}">📜 ${t("course.getcert")}</button>` : ""}
          </div>
        </div>`;
      g.appendChild(card);
    });
    $$("#courseGrid [data-open]").forEach(b => b.addEventListener("click", () => openCourse(b.dataset.open)));
    $$("#courseGrid [data-cert]").forEach(b => b.addEventListener("click", () => makeCertificate(b.dataset.cert)));
  }

  // ---------- Course view ----------
  let curCourse = null, curMod = 0;
  function openCourse(cid) {
    curCourse = C().find(c => c.id === cid);
    if (!curCourse || isLocked(curCourse)) return;
    curMod = state.progress.cur[cid] || 0;
    $("#courseTitle").textContent = curCourse.name[LANG] || curCourse.name.fr;
    renderModList(); renderLesson(); show("v-course");
  }
  function renderModList() {
    const mods = modulesOf(curCourse); const dn = doneSet(curCourse.id);
    const box = $("#modButtons"); box.innerHTML = "";
    mods.forEach((m, i) => {
      const b = document.createElement("button");
      b.className = (i === curMod ? "active " : "") + (dn.has(i) ? "done" : "");
      b.innerHTML = `<span class="n">${dn.has(i) ? "✓" : i + 1}</span><span>${esc(m.title)}</span>`;
      b.addEventListener("click", () => { curMod = i; state.progress.cur[curCourse.id] = i; saveProgress(); renderModList(); renderLesson(); });
      box.appendChild(b);
    });
    const ex = document.createElement("button");
    ex.className = "exam-btn";
    const certified = isCertified(curCourse.id);
    ex.innerHTML = `<span class="n">${certified ? "✓" : "★"}</span><span>${t("course.exam")} — ${T[LANG].qOf(curCourse.exam.n)}, ${T[LANG].minutes(curCourse.exam.minutes)}</span>`;
    ex.addEventListener("click", () => startExam(curCourse));
    box.appendChild(ex);
  }
  function renderLesson() {
    const mods = modulesOf(curCourse); const m = mods[curMod];
    $("#lessonTitle").textContent = m.title;
    $("#lessonPos").textContent = T[LANG].modOf(curMod + 1, mods.length);
    $("#lessonBody").innerHTML = m.html;
    $("#lessonBody").scrollTop = 0;
    $("#modHint").textContent = m.manual ? "Source : Manuel de Passation des Marchés INSAPT" : "";
    $("#prevMod").disabled = curMod === 0;
  }
  function markDone() {
    const cid = curCourse.id;
    const arr = state.progress.done[cid] || (state.progress.done[cid] = []);
    if (!arr.includes(curMod)) arr.push(curMod);
    const mods = modulesOf(curCourse);
    if (curMod < mods.length - 1) { curMod++; state.progress.cur[cid] = curMod; }
    saveProgress(); toast(t("saved"), "ok");
    renderModList(); renderLesson();
  }

  // ---------- Exam engine ----------
  function pickQuestions(course) {
    const pool = (window.EL_QB || []).filter(q => q.lvl.some(l => course.exam.pool.includes(l)));
    // shuffle copy
    const arr = pool.slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
    let qs = arr.slice(0, course.exam.n);
    // if pool smaller than n, repeat-shuffle to fill (keeps exam length as spec)
    while (qs.length < course.exam.n && arr.length) qs = qs.concat(arr.slice(0, course.exam.n - qs.length));
    return qs.map(q => {
      // shuffle options, track new answer index
      const idx = q.o.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[idx[i], idx[j]] = [idx[j], idx[i]]; }
      return { q: q.q, o: idx.map(i => q.o[i]), a: idx.indexOf(q.a) };
    });
  }
  function startExam(course) {
    if (!isCourseComplete(course.id)) { toast(t("mustFinish"), "warn"); return; }
    const qs = pickQuestions(course);
    examCtx = { course, qs, answers: new Array(qs.length).fill(-1), deadline: Date.now() + course.exam.minutes * 60000 };
    $("#examTitle").textContent = (course.name[LANG] || course.name.fr);
    $("#examMeta").textContent = T[LANG].qOf(qs.length) + " · " + T[LANG].minutes(course.exam.minutes);
    const body = $("#examBody"); body.innerHTML = "";
    $("#examResult").innerHTML = "";
    qs.forEach((q, qi) => {
      const d = document.createElement("div"); d.className = "qitem";
      d.innerHTML = `<div class="qq"><span class="qn">${qi + 1}</span>${esc(q.q)}</div>` +
        q.o.map((o, oi) => `<label class="opt" data-q="${qi}" data-o="${oi}"><input type="radio" name="q${qi}"><span>${esc(o)}</span></label>`).join("");
      body.appendChild(d);
    });
    $$(".opt", body).forEach(l => l.addEventListener("click", () => {
      const qi = +l.dataset.q, oi = +l.dataset.o;
      examCtx.answers[qi] = oi;
      $$(`.opt[data-q="${qi}"]`, body).forEach(x => x.classList.remove("sel"));
      l.classList.add("sel"); l.querySelector("input").checked = true;
    }));
    clearInterval(examCtx.timerId);
    examCtx.timerId = setInterval(tickTimer, 500);
    tickTimer(); show("v-exam");
  }
  function tickTimer() {
    if (!examCtx) return;
    const left = Math.max(0, examCtx.deadline - Date.now());
    const m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
    const el = $("#examTimer");
    el.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    el.classList.toggle("low", left < 5 * 60000);
    if (left <= 0) { submitExam(true); }
  }
  function submitExam(auto) {
    if (!examCtx) return;
    clearInterval(examCtx.timerId);
    const { course, qs, answers } = examCtx;
    let good = 0;
    qs.forEach((q, i) => { if (answers[i] === q.a) good++; });
    const score = Math.round(good / qs.length * 100);
    const passMark = state.settings.pass || 75;
    const passed = score >= passMark;
    // reveal corrections
    $$(".qitem", $("#examBody")).forEach((d, qi) => {
      $$(".opt", d).forEach((l, oi) => {
        if (oi === qs[qi].a) l.classList.add("correct");
        else if (answers[qi] === oi) l.classList.add("wrong");
        l.style.pointerEvents = "none";
      });
    });
    $("#examSubmit").disabled = true;
    const res = $("#examResult");
    res.innerHTML = `<div class="quiz-shell" style="margin-top:18px"><div class="score-banner ${passed ? "pass" : "fail"}">
      <div class="big">${score}%</div>
      <h3>${passed ? t("pass") : t("fail")} — ${t("yourScore")} : ${good}/${qs.length}${auto ? " (temps écoulé)" : ""}</h3>
      <p class="muted">Seuil de réussite : ${passMark}%</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px">
        ${passed ? `<button class="btn btn-gold" id="btnCert">📜 ${t("download")}</button>` : `<button class="btn btn-primary" id="btnRetry">${t("retry")}</button>`}
        <button class="btn btn-ghost" id="btnBack">${t("backCourse")}</button>
      </div></div></div>`;
    if (passed) {
      state.progress.certs = state.progress.certs || {};
      state.progress.certs[course.id] = { score, date: new Date().toISOString().slice(0, 10) };
      saveProgress(); toast(t("certReady"), "ok");
      $("#btnCert").addEventListener("click", () => makeCertificate(course.id));
    } else {
      $("#btnRetry").addEventListener("click", () => startExam(course));
    }
    $("#btnBack").addEventListener("click", () => { openCourse(course.id); });
    examCtx = null;
  }

  // ---------- Certificate PDF ----------
  function makeCertificate(cid) {
    const course = C().find(c => c.id === cid);
    const cert = (state.progress.certs || {})[cid];
    if (!course || !cert) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" }); // 297 x 210
    const W = 297, H = 210;
    const BLUE = [0, 38, 100], GOLD = [254, 203, 0], RED = [198, 12, 48], NAVY = [3, 26, 61];

    // background & frame
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, "F");
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, 14, "F");
    // flag ribbon top
    doc.setFillColor(...BLUE); doc.rect(0, 14, W / 3, 4, "F");
    doc.setFillColor(...GOLD); doc.rect(W / 3, 14, W / 3, 4, "F");
    doc.setFillColor(...RED); doc.rect(2 * W / 3, 14, W / 3, 4, "F");
    // outer border
    doc.setDrawColor(...NAVY); doc.setLineWidth(1.2); doc.rect(8, 24, W - 16, H - 46);
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.rect(11, 27, W - 22, H - 52);

    // header
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("RÉPUBLIQUE DU TCHAD — UNITÉ · TRAVAIL · PROGRÈS", W / 2, 9.5, { align: "center" });

    doc.setTextColor(...NAVY); doc.setFontSize(15);
    doc.text("INSTITUT NATIONAL DE SANTÉ PUBLIQUE DU TCHAD", W / 2, 38, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(90, 100, 130);
    doc.text("INSAPT Academy — Programme de Formation en Passation des Marchés", W / 2, 45, { align: "center" });

    doc.setFont("times", "bolditalic"); doc.setFontSize(34); doc.setTextColor(...BLUE);
    doc.text("Certificat de Réussite", W / 2, 63, { align: "center" });
    doc.setDrawColor(...GOLD); doc.setLineWidth(1); doc.line(W / 2 - 45, 67, W / 2 + 45, 67);

    doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(60, 70, 100);
    doc.text("Le présent certificat est décerné à", W / 2, 80, { align: "center" });

    doc.setFont("times", "bold"); doc.setFontSize(27); doc.setTextColor(...NAVY);
    doc.text(state.learner.name.toUpperCase(), W / 2, 94, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(90, 100, 130);
    doc.text(state.learner.section, W / 2, 101, { align: "center" });

    doc.setFontSize(12); doc.setTextColor(60, 70, 100);
    doc.text("pour avoir suivi avec succès le parcours", W / 2, 113, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...RED);
    const cname = course.name.fr;
    doc.text(cname, W / 2, 122, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(11.5); doc.setTextColor(60, 70, 100);
    doc.text(`et réussi l'examen final avec un score de ${cert.score} % (seuil requis : ${state.settings.pass || 75} %).`, W / 2, 130, { align: "center" });

    // date & ID
    doc.setFontSize(10); doc.setTextColor(90, 100, 130);
    const certId = "INSAPT-AC-" + cid.toUpperCase() + "-" + (state.learner.id || "L").toString().replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase() + "-" + cert.date.replace(/-/g, "");
    doc.text("Fait à N'Djaména, le " + cert.date, 24, 165);
    doc.text("N° de certificat : " + certId, 24, 171);

    // signature block
    doc.setDrawColor(...NAVY); doc.setLineWidth(0.4); doc.line(W - 110, 162, W - 26, 162);
    doc.setFont("times", "bolditalic"); doc.setFontSize(15); doc.setTextColor(...NAVY);
    doc.text(state.settings.signer || "Pr Ali Mahamat Moussa", W - 68, 158, { align: "center" });
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(state.settings.signer || "Pr Ali Mahamat Moussa", W - 68, 168, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(90, 100, 130);
    doc.text(state.settings.signerTitle || "Directeur Général, INSAPT", W - 68, 173.5, { align: "center" });

    // bottom flag band
    doc.setFillColor(...BLUE); doc.rect(0, H - 18, W / 3, 8, "F");
    doc.setFillColor(...GOLD); doc.rect(W / 3, H - 18, W / 3, 8, "F");
    doc.setFillColor(...RED); doc.rect(2 * W / 3, H - 18, W / 3, 8, "F");
    doc.setFillColor(...NAVY); doc.rect(0, H - 10, W, 10, "F");
    // tiny white copyright (spec)
    doc.setFont("helvetica", "normal"); doc.setFontSize(4.5); doc.setTextColor(255, 255, 255);
    doc.text("© Innocent Forteh", W / 2, H - 3.5, { align: "center" });

    doc.save("Certificat-INSAPT-" + cid.toUpperCase() + "-" + state.learner.name.replace(/\s+/g, "_") + ".pdf");
  }

  // ---------- Admin ----------
  async function openAdmin() {
    const u = prompt("Identifiant administrateur :"); if (u == null) return;
    const p = prompt("Mot de passe :"); if (p == null) return;
    if (u.trim() !== ADMIN.user || p !== ADMIN.pass) { toast("Identifiants administrateur incorrects", "err"); return; }
    state.admin = true;
    $("#loginWrap").style.display = "none";
    $("#app").classList.add("on");
    $("#whoChip").textContent = "Administrateur";
    show("v-admin");
    loadAdmin();
  }
  async function loadAdmin() {
    const th = $("#admTbl thead"), tb = $("#admTbl tbody");
    th.innerHTML = "<tr><th>Nom</th><th>Section</th><th>Inscrit le</th><th>Parcours certifiés</th><th>Modules terminés</th><th>Dernière activité</th></tr>";
    tb.innerHTML = "<tr><td colspan='6' class='muted'>Chargement…</td></tr>";
    try {
      const j = await gsGet({ action: "el_admin_list", admin: ADMIN.user + ":" + ADMIN.pass });
      if (!(j && j.ok)) throw 0;
      window._admRows = j.learners || [];
      tb.innerHTML = window._admRows.length ? window._admRows.map(L => {
        let prog = {}; try { prog = JSON.parse(L.progress || "{}"); } catch (e) { }
        const certs = Object.keys(prog.certs || {});
        const mods = Object.values(prog.done || {}).reduce((s, a) => s + a.length, 0);
        return `<tr><td><b>${esc(L.name)}</b></td><td>${esc(L.section)}</td><td>${esc((L.created || "").slice(0, 10))}</td>
          <td>${certs.length ? certs.map(c => `<span class="badge ok">${c.toUpperCase()} ${prog.certs[c].score}%</span>`).join(" ") : "<span class='badge warn'>Aucun</span>"}</td>
          <td>${mods}</td><td>${esc((L.updated || "").slice(0, 10))}</td></tr>`;
      }).join("") : "<tr><td colspan='6' class='muted'>Aucun apprenant inscrit.</td></tr>";
      // settings
      const s = await gsGet({ action: "el_settings" });
      if (s && s.ok && s.settings) {
        $("#setSigner").value = s.settings.signer || $("#setSigner").value;
        $("#setSignerTitle").value = s.settings.signerTitle || $("#setSignerTitle").value;
        $("#setPass").value = s.settings.pass || $("#setPass").value;
        applySettings(s.settings);
      }
    } catch (e) {
      tb.innerHTML = "<tr><td colspan='6' class='muted'>Impossible de joindre Google — vérifiez le déploiement du script et la clé.</td></tr>";
    }
  }
  function adminExportCSV() {
    const rows = (window._admRows || []).map(L => {
      let prog = {}; try { prog = JSON.parse(L.progress || "{}"); } catch (e) { }
      return {
        nom: L.name, section: L.section, inscrit: (L.created || "").slice(0, 10),
        certificats: Object.entries(prog.certs || {}).map(([k, v]) => k + ":" + v.score + "%").join(" | "),
        modules_termines: Object.values(prog.done || {}).reduce((s, a) => s + a.length, 0),
        maj: (L.updated || "").slice(0, 10)
      };
    });
    if (!rows.length) { toast("Rien à exporter", "err"); return; }
    const cols = Object.keys(rows[0]);
    const csv = [cols.join(",")].concat(rows.map(r => cols.map(c => { let v = String(r[c] ?? ""); if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"'; return v; }).join(","))).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
    a.download = "insapt-academy-apprenants.csv"; a.click();
  }
  async function saveSettings() {
    const s = { signer: $("#setSigner").value.trim(), signerTitle: $("#setSignerTitle").value.trim(), pass: parseInt($("#setPass").value) || 75 };
    applySettings(s);
    try {
      const j = await gsPost({ action: "el_settings_set", admin: ADMIN.user + ":" + ADMIN.pass, settings: s });
      toast(j && j.ok ? "Paramètres enregistrés dans Google" : "Échec de l'enregistrement", j && j.ok ? "ok" : "err");
    } catch (e) { toast("Hors ligne — paramètres appliqués localement", "warn"); }
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", () => {
    applyLang(LANG);
    $$(".lang-mini button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

    // resume last session
    const last = localStorage.getItem(LS + "last");
    if (last) { try { const L = JSON.parse(last); $("#lgName").value = L.name; $("#lgSection").value = L.section; } catch (e) { } }

    $("#loginForm").addEventListener("submit", async e => {
      e.preventDefault();
      const name = $("#lgName").value.trim(), section = $("#lgSection").value;
      if (name.length < 3) { const er = $("#loginErr"); er.textContent = "Veuillez saisir votre nom complet."; er.classList.add("show"); return; }
      $("#loginErr").classList.remove("show");
      toast("Connexion…");
      await loginLearner(name, section);
      toast(state.online ? t("synced") : t("offline"), state.online ? "ok" : "warn");
      enterApp();
    });

    $("#adminLink").addEventListener("click", openAdmin);
    $("#logoutBtn").addEventListener("click", () => location.reload());
    $("#navDash").addEventListener("click", e => { e.preventDefault(); if (state.admin && !state.learner) return; renderDash(); show("v-dash"); });
    $("#backDash").addEventListener("click", e => { e.preventDefault(); renderDash(); show("v-dash"); });
    $("#doneMod").addEventListener("click", markDone);
    $("#prevMod").addEventListener("click", () => { if (curMod > 0) { curMod--; state.progress.cur[curCourse.id] = curMod; saveProgress(); renderModList(); renderLesson(); } });
    $("#examSubmit").addEventListener("click", () => submitExam(false));
    $("#examCancel").addEventListener("click", () => { if (examCtx) { clearInterval(examCtx.timerId); const c = examCtx.course; examCtx = null; openCourse(c.id); } });
    $("#admRefresh").addEventListener("click", loadAdmin);
    $("#admExport").addEventListener("click", adminExportCSV);
    $("#admExit").addEventListener("click", () => location.reload());
    $("#setSave").addEventListener("click", saveSettings);
  });
})();
