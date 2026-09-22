
const page = document.body.dataset.page;
const base = page === "review" ? "../" : "./";
const money = (value) => {
  const number = Number(value || 0);
  const formatted = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.abs(number));
  return number < 0 ? `(${formatted})` : formatted;
};
const signed = (value) => value === null || value === undefined ? "—" : `${Number(value) > 0 ? "+" : ""}${money(value)}`;
const escape = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const label = (key) => key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const ledger = (entries, totalKey) => `<table class="ledger"><thead><tr><th>Line</th><th>EUR</th></tr></thead><tbody>${entries.map(([key, value]) => `<tr class="${key === totalKey ? "total" : ""}"><td>${escape(label(key))}</td><td>${money(value)}</td></tr>`).join("")}</tbody></table>`;
const statementEntries = (statement, keys) => keys.filter((key) => key in statement).map((key) => [key, statement[key]]);
const evidence = (items) => `<ul class="evidence-list">${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;
const decisionMarkup = (decision) => {
  const tier = decision.reviewTier === "material_judgment" ? "material" : "";
  const confidence = decision.confidence === "low" ? "low" : "";
  return `<details class="decision" data-tier="${decision.reviewTier}" data-confidence="${decision.confidence}"><summary><span class="decision-id">${decision.id}</span><span>${escape(decision.question)}</span><span class="tag ${tier || confidence}">${tier ? "material" : decision.confidence}</span></summary><div class="decision-body"><p><strong>Decision:</strong> ${escape(decision.answer)}</p><p class="mini-evidence"><strong>Evidence:</strong> ${escape(decision.evidence.join(" · "))}</p></div></details>`;
};
const reviewDecision = (decision) => `<article class="card review-decision"><h3><span class="decision-id">${decision.id}</span> ${escape(decision.question)}</h3><p><strong>Final decision:</strong> ${escape(decision.answer)}</p><p><strong>First AI proposal:</strong> ${escape(decision.aiProposal)}</p><p><strong>Independent challenge:</strong> ${escape(decision.independentChallenge)}</p><p><strong>Reasoning:</strong> ${escape(decision.studentReasoning)}</p><div class="effect-grid">${Object.entries(decision.statementEffect).map(([key, value]) => `<div class="effect"><span>${escape(label(key))}</span><b>${signed(value)}</b></div>`).join("")}</div><p class="mini-evidence"><strong>Evidence:</strong> ${escape(decision.evidence.join(" · "))}</p></article>`;
function mainView(data) {
  const pnl = data.statements.profitAndLoss;
  const cash = data.statements.cashFlow;
  const bs = data.statements.balanceSheet;
  const schedules = Object.entries(data.schedules).map(([name, values]) => `<article class="card"><h3>${escape(label(name))}</h3>${ledger(Object.entries(values), Object.keys(values).at(-1))}</article>`).join("");
  return `<section class="case-banner"><div><p class="eyebrow">${escape(data.caseId)} · Student ${escape(data.student.name)}</p><h1>Divorce Party International</h1><p>Evidence-led reconstruction of the company’s finances following the takeover.</p></div><p class="as-of">Reporting date<br><strong>31 August 2026</strong></p></section>
  <section class="metric-grid" aria-label="Headline results"><article class="metric"><p>Corrected profit</p><strong>${money(pnl.profitForPeriod)}</strong><small>not management’s €312,000 claim</small></article><article class="metric"><p>Closing bank cash</p><strong>${money(bs.cash)}</strong><small>agrees to bank confirmation</small></article><article class="metric"><p>Closing equity</p><strong>${money(bs.equity)}</strong><small>after €110,000 owner distributions</small></article></section>
  <section class="section"><div class="section-heading"><h2>Corrected statements</h2><p>EUR · year to 31 August 2026</p></div><div class="statement-grid"><article class="card"><h3>Profit and loss</h3>${ledger(statementEntries(pnl, ["revenue","materialsCogs","directEventPayroll","totalCogs","grossProfit","operatingExpenses","operatingProfit","interestExpense","profitForPeriod"]), "profitForPeriod")}</article><article class="card"><h3>Cash flow</h3>${ledger(statementEntries(cash, ["openingCash","netOperatingCashFlow","netInvestingCashFlow","netFinancingCashFlow","netChangeInCash","closingCash"]), "closingCash")}</article><article class="card"><h3>Balance sheet</h3>${ledger(statementEntries(bs, ["cash","netReceivables","inventory","netPpe","totalAssets","totalLiabilities","equity","totalLiabilitiesAndEquity"]), "totalLiabilitiesAndEquity")}</article></div></section>
  <section class="section"><div class="section-heading"><h2>Evidence record</h2><p>Files used to reconstruct the accounts</p></div>${evidence(data.evidence)}</section>
  <section class="section"><div class="section-heading"><h2>Supporting schedules</h2><p>Every headline number links back to a roll-forward</p></div><div class="schedule-grid">${schedules}</div></section>
  <section class="section"><div class="section-heading"><h2>Decision register</h2><p>${data.decisions.length} certified decisions</p></div><div class="decision-controls"><button class="filter-button active" data-filter="all">All decisions</button><button class="filter-button" data-filter="material_judgment">Material judgments</button><button class="filter-button" data-filter="low-medium">Low / medium confidence</button></div><div class="decision-list">${data.decisions.map(decisionMarkup).join("")}</div></section>
  <section class="section review-grid"><div><div class="section-heading"><h2>Reconciliations</h2><p>All key checks tie</p></div><div class="card"><ul class="plain-list">${data.reconciliations.map((item) => `<li><strong>${escape(item.name)}</strong><br>${escape(item.calculation)} <span class="tag">Difference ${money(item.difference)}</span></li>`).join("")}</ul></div></div><div><div class="section-heading"><h2>Uncertainty</h2><p>Visible, not hidden</p></div><div class="card notice"><ul class="plain-list">${data.uncertainties.map((item) => `<li><strong>${escape(item.topic)}</strong><br>${escape(item.explanation)}</li>`).join("")}</ul></div></div></section>
  <section class="section"><div class="card board"><p class="eyebrow">Board recommendation</p><h2>${escape(data.boardRecommendation.recommendation)}</h2><p>${escape(data.boardRecommendation.solvencyWarning)}</p><ul class="plain-list">${data.boardRecommendation.immediateActions.map((action) => `<li>${escape(action)}</li>`).join("")}</ul></div></section><p class="footer-note">Prepared for review. The complete machine-readable record is available through the Submission data link.</p>`;
}
function reviewView(data) {
  const material = data.decisions.filter((decision) => decision.reviewTier === "material_judgment");
  const flags = data.decisions.filter((decision) => decision.confidence !== "high");
  return `<section class="case-banner"><div><p class="eyebrow">Assessor view · ${escape(data.caseId)}</p><h1>AI review trail</h1><p>Material decisions, independent challenges, final certification, and uncertainty in one compact view.</p></div><p class="as-of">${material.length} material decisions<br><strong>${flags.length} decisions need attention</strong></p></section>
  <section class="metric-grid"><article class="metric"><p>Corrected profit</p><strong>${money(data.statements.profitAndLoss.profitForPeriod)}</strong><small>evidence-led result</small></article><article class="metric"><p>Low / medium confidence</p><strong>${flags.length}</strong><small>shown below and in the case file</small></article><article class="metric"><p>Unresolved issues</p><strong>${data.uncertainties.length}</strong><small>explicitly disclosed</small></article></section>
  <section class="review-grid"><div><div class="section-heading"><h2>Material judgments</h2><p>First AI view, challenge, final answer</p></div>${material.map(reviewDecision).join("")}</div><aside><div class="section-heading"><h2>Attention points</h2><p>For assessor focus</p></div><div class="card"><ul class="flag-list">${flags.map((decision) => `<li><strong>${decision.id} · ${escape(decision.question)}</strong>${escape(decision.confidence)} confidence</li>`).join("")}</ul></div><div class="section-heading"><h2>Uncertainty</h2><p>Not resolved by assumption</p></div><div class="card notice"><ul class="plain-list">${data.uncertainties.map((item) => `<li><strong>${escape(item.topic)}</strong><br>${escape(item.explanation)}</li>`).join("")}</ul></div><div class="section-heading"><h2>Certification</h2><p>Student record</p></div><div class="card"><p><strong>${escape(data.student.name)}</strong><br>${escape(data.student.id)}</p><p>Final decisions are recorded in <a href="../submission.json">submission.json</a>.</p></div></aside></section>`;
}
async function init() {
  try {
    const data = window.SUBMISSION_DATA || await fetch(`${base}submission.json`).then((response) => {
      if (!response.ok) throw new Error("Could not load the submission data");
      return response.json();
    });
    document.getElementById("app").innerHTML = page === "review" ? reviewView(data) : mainView(data);
    if (page === "main") {
      document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
        document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.filter;
        document.querySelectorAll(".decision").forEach((decision) => {
          const show = filter === "all" || decision.dataset.tier === filter || (filter === "low-medium" && decision.dataset.confidence !== "high");
          decision.hidden = !show;
        });
      }));
    }
  } catch (error) { document.getElementById("app").innerHTML = `<div class="notice"><strong>The submission data could not be loaded.</strong><br>${escape(error.message)}</div>`; }
}
init();
