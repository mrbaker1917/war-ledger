const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const count = new Intl.NumberFormat("en-US");

function formatValue(side) {
  if (side.unavailable) return "—";
  if (side.text) return side.text;
  const suffix = side.prefix === "$" ? " billion" : "";
  if (side.low === side.high) {
    return side.prefix === "$" ? `$${money.format(side.low)}${suffix}` : count.format(side.low);
  }
  const body = side.prefix === "$"
    ? `$${money.format(side.low)}–${money.format(side.high)}${suffix}`
    : `${count.format(side.low)}–${count.format(side.high)}`;
  return body;
}

function highOf(side) {
  if (!side || side.unavailable || side.text) return 0;
  return side.high;
}

function barHtml(side, max, showBar) {
  if (side && side.text) {
    return `
      <p class="num">${side.text}</p>
      <p class="num-note">${side.note || ""}</p>`;
  }
  if (!side || side.unavailable) {
    const why = side && side.reason ? side.reason : "";
    return `
      <p class="num">—</p>
      <p class="reason">${why}</p>
      <div class="track unmeasured" aria-hidden="true"></div>`;
  }
  if (!showBar) {
    return `
      <p class="num">${formatValue(side)}</p>
      <p class="num-note">${side.note || ""}</p>`;
  }
  const width = Math.max(2, (side.high / max) * 100);
  const solid = (side.low / side.high) * 100;
  return `
    <p class="num">${formatValue(side)}</p>
    <p class="num-note">${side.note || ""}</p>
    <div class="track" aria-hidden="true">
      <div class="fill" style="width:${width}%"><span style="width:${solid}%"></span></div>
    </div>`;
}

function pairHtml(view) {
  const max = Math.max(highOf(view.ukraine), highOf(view.russia), 1);
  const comparable = !view.ukraine.unavailable && !view.russia.unavailable && !view.ukraine.text && !view.russia.text;
  let ratio = "";
  if (comparable && view.ratio) ratio = `<p class="ratio">${view.ratio}</p>`;
  return `
    <div class="pair">
      <div class="side ua">${barHtml(view.ukraine, max, comparable)}</div>
      <div class="side ru">${barHtml(view.russia, max, comparable)}</div>
    </div>
    ${ratio}`;
}

const summary = [
  {
    title: "Military deaths",
    basis: "CSIS estimate, Feb 2022–Jun 2026",
    ukraine: { low: 125000, high: 150000, note: "fatalities" },
    russia: { low: 400000, high: 450000, note: "fatalities" },
    ratio: "About three Russian deaths for every Ukrainian death, using the middle of each range.",
  },
  {
    title: "Civilian deaths",
    basis: "OHCHR verified count, cited Nov 2026",
    ukraine: { low: 17968, high: 17968, note: "verified minimum" },
    russia: { unavailable: true, reason: "No verified national total" },
  },
  {
    title: "Military injured",
    basis: "Ukraine’s own figure, Jul 2026. Russia publishes none.",
    ukraine: { low: 400000, high: 400000, note: "wounded, official" },
    russia: { unavailable: true, reason: "No official wounded count" },
  },
  {
    title: "All military casualties",
    basis: "CSIS: killed, wounded, and missing, through Jun 2026",
    ukraine: { low: 525000, high: 625000, note: "not wounded alone" },
    russia: { low: 1400000, high: 1400000, note: "about 1.4 million" },
    ratio: "About two and a half Russian casualties for every Ukrainian casualty over the whole period CSIS measured.",
  },
  {
    title: "Civilian injured",
    basis: "OHCHR verified count, cited Nov 2026",
    ukraine: { low: 57713, high: 57713, note: "verified minimum" },
    russia: { unavailable: true, reason: "No verified national total" },
  },
  {
    title: "Infrastructure damage",
    basis: "Direct damage through 31 Dec 2025",
    ukraine: { low: 195.1, high: 195.1, prefix: "$", note: "RDNA5, direct damage" },
    russia: { unavailable: true, reason: "No national damage survey" },
  },
];

const sectors = [
  ["Housing", 61.1],
  ["Transport", 40.3],
  ["Energy and extractives", 24.8],
  ["Commerce and industry", 19.2],
];

const sections = [
  {
    id: "military-deaths",
    title: "Military deaths",
    intro: "Neither army publishes a complete death roll. The comparable pair is an outside estimate that uses one method for both sides. Name lists and official statements measure something narrower, so they sit on their own.",
    views: [
      {
        id: "estimate",
        label: "Independent estimate",
        ukraine: { low: 125000, high: 150000, note: "CSIS fatalities" },
        russia: { low: 400000, high: 450000, note: "CSIS fatalities" },
        ratio: "Middle of the ranges: roughly 138,000 and 425,000. That is about three to one.",
        html: `
          <p>The Center for Strategic and International Studies estimated these bands for February 2022 through June 2026. CSIS also said the loss rate in the first half of 2026 had moved to nearly eight Russian casualties for every Ukrainian casualty. That is a recent rate, not the cumulative ratio above.</p>
          <p>GCHQ’s director said in public that almost 500,000 Russian soldiers had been killed, which sits at the top of the CSIS band and below the BBC extrapolation in the next view.</p>`,
        sources: [
          ["CSIS, “Russian Blood and Treasure”", "https://www.csis.org/analysis/russian-blood-and-treasure-ballooning-costs-putins-war", "through June 2026"],
          ["BBC News, on the GCHQ figure", "https://www.bbc.co.uk/news/articles/c4g44gprnnvo", "“almost 500,000” Russian soldiers killed"],
        ],
      },
      {
        id: "named",
        label: "Named lists",
        ukraine: { low: 103418, high: 103418, note: "UALosses killed count" },
        russia: { low: 287831, high: 287831, note: "BBC and Mediazona names" },
        ratio: "These are confirmed names, not estimates of the dead. Coverage rules differ, so the bar is a count of records, not a census.",
        html: `
          <p>BBC Russian and Mediazona had confirmed 287,831 named Russian military deaths by their November 2026 update. They treat public obituaries, relatives’ posts, cemeteries, and registries as capturing about 45 to 55 percent of deaths, which implies roughly 523,000 to 640,000 Russian dead. Adding their separate 2022 estimate for Donetsk and Luhansk formations, and named North Korean deaths, lifts the top of that range further. Those additions are not in the bar.</p>
          <p>UALosses listed 212,974 people for 24 February 2022 through 21 June 2026, with 103,418 in its killed count and 97,938 in its missing count. Ukraine’s government has disputed the project. Names lag the fighting, on both lists.</p>`,
        sources: [
          ["BBC Russian, with Mediazona", "https://www.bbc.com/russian/articles/c8r4gx693qe4o", "November 2026"],
          ["Mediazona, English update", "https://en.zona.media/article/2026/11/06/casualties_eng-trl", "named list through 6 Nov 2026"],
          ["UALosses", "https://ualosses.org/en/military_units/", "24 Feb 2022–21 Jun 2026"],
        ],
      },
      {
        id: "claims",
        label: "Official statements",
        ukraine: { text: "55,000", note: "Zelensky, 5 Feb 2026", reason: "" },
        russia: { text: "Not published", note: "Moscow gives no death toll", reason: "Moscow gives no death toll" },
        html: `
          <p>On 5 February 2026 President Zelensky told France 2 that 55,000 Ukrainian soldiers had been killed on the battlefield, with a large number still missing. In a July 2026 Fox News interview he said around 50,000 killed and about 400,000 wounded. The later death figure is lower. He did not explain the difference, so the two statements are not a time series.</p>
          <p>Russia does not publish its own military death toll. In that July interview Zelensky estimated about 700,000 Russian soldiers killed and about 1.6 million Russian military casualties. The General Staff’s daily personnel series is <a href="#general-staff">the next section</a>. On 9 November it described that day’s 2,980 as killed and severely wounded, so those figures stay off the death bars.</p>`,
        sources: [
          ["Meduza, on the France 2 interview", "https://meduza.io/en/news/2026/02/05/zelensky-says-55-000-ukrainian-soldiers-have-died-in-the-full-scale-war-with-russia-open-source-data-suggests-a-higher-toll", "5 Feb 2026"],
          ["Kyiv Independent, on the Fox interview", "https://kyivindependent.com/ukraine-war-latest-russian-military-deaths-14-times-higher-than-ukraines-zelensky-says/", "July 2026"],
        ],
      },
    ],
  },
  {
    id: "civilian-deaths",
    title: "Civilian deaths",
    intro: "The UN Human Rights Monitoring Mission verifies civilian deaths in Ukraine one incident at a time and says the true toll is significantly higher. It does not publish a matching verified total for Russia.",
    views: [
      {
        id: "ohchr",
        label: "UN verified",
        ukraine: { low: 17968, high: 17968, note: "includes 874 children" },
        russia: { unavailable: true, reason: "No verified national total" },
        html: `
          <p>A UN official told the Security Council in November 2026 that OHCHR had verified at least 17,968 civilians killed in Ukraine since the full-scale invasion, including 874 children. September 2026 alone was 328 killed, 85 percent higher than September 2025, and October was described as just as high. The mission’s access to occupied territory is limited, which is one reason it calls the total a floor.</p>
          <p>The same briefing said the Secretary-General is concerned about civilian casualties inside Russia, and cited Russian authorities for September: at least 53 people killed. That monthly official claim is not a war total, so it is not drawn against Ukraine’s cumulative count.</p>
          <div class="fragments">
            <article>
              <h4>Ukraine, another count</h4>
              <p>Prosecutor General Anton Kovalsky, figures published 23 October 2026: 19,349 civilians confirmed killed, including 762 children. His office and OHCHR do not count the same way.</p>
            </article>
            <article>
              <h4>Russia, pieces of a total</h4>
              <p>September 2026, Russian authorities via the UN: at least 53 killed. Belgorod region through late August 2026, from local accounting reported by Novaya Gazeta: 632 civilians killed in four and a half years. One region, not the country.</p>
            </article>
          </div>`,
        sources: [
          ["UN official, Security Council", "https://dppa.un.org/en/speeches-and-statements/remarks-by-director-for-europe-and-central-asia-division-to-the", "November 2026"],
          ["OHCHR monitoring mission, September", "https://ukraine.ohchr.org/en/Civilian-casualties-remain-at-record-levels-amid-intensifying-attacks-on-energy-as-winter-approaches", "September 2026"],
          ["Kyiv Post, on the prosecutor’s figures", "https://www.kyivpost.com/post/89690", "23 Oct 2026"],
          ["Novaya Gazeta, Belgorod", "https://novayagazeta.ru/articles/2026/08/28/eto-referendum-ob-otnoshenii-k", "late August 2026"],
        ],
      },
    ],
  },
  {
    id: "military-injured",
    title: "Military injured",
    intro: "“Injured” is the category with the worst public record. Ukraine has given a wounded figure for its own forces. Russia has not. The closest shared measurement mixes the dead, the wounded, and the missing.",
    views: [
      {
        id: "wounded",
        label: "Wounded only",
        ukraine: { low: 400000, high: 400000, note: "Zelensky, July 2026" },
        russia: { unavailable: true, reason: "No official wounded count" },
        html: `
          <p>In the July 2026 Fox interview, Zelensky said about 400,000 Ukrainian service members had been wounded. In February 2025 he had said nearly 380,000 wounded. Treat the July figure as his latest public statement, not as a audited medical tally.</p>
          <p>The Russian Ministry of Defence does not publish a count of its wounded. Inventing one by subtracting a death estimate from a casualty estimate would mix sources and would still include the missing. This page does not do that.</p>`,
        sources: [
          ["Kyiv Independent, on the Fox interview", "https://kyivindependent.com/ukraine-war-latest-russian-military-deaths-14-times-higher-than-ukraines-zelensky-says/", "July 2026"],
          ["Meduza, on the earlier wounded figure", "https://meduza.io/en/news/2026/02/05/zelensky-says-55-000-ukrainian-soldiers-have-died-in-the-full-scale-war-with-russia-open-source-data-suggests-a-higher-toll", "cites Feb 2025: nearly 380,000 wounded"],
        ],
      },
      {
        id: "all",
        label: "Killed, wounded, and missing",
        ukraine: { low: 525000, high: 625000, note: "CSIS total casualties" },
        russia: { low: 1400000, high: 1400000, note: "CSIS, about 1.4 million" },
        ratio: "Roughly two and a half to one. CSIS described 1.4 million as approximate, so the Russian side is a point, not a hard count.",
        html: `
          <p>Use this row when the question is the size of each force’s losses, and the wounded-only row when the question is injuries. They answer different questions. Ukrainian officials have put Russian casualties near 1.6 million. That claim is in the same neighborhood as CSIS and is still a claim.</p>`,
        sources: [
          ["CSIS, “Russian Blood and Treasure”", "https://www.csis.org/analysis/russian-blood-and-treasure-ballooning-costs-putins-war", "February 2022–June 2026"],
        ],
      },
    ],
  },
  {
    id: "civilian-injured",
    title: "Civilian injured",
    intro: "Same source and the same limit as civilian deaths. OHCHR’s injured count for Ukraine is a verified floor. There is no verified national floor for Russia.",
    views: [
      {
        id: "ohchr",
        label: "UN verified",
        ukraine: { low: 57713, high: 57713, note: "includes 3,504 children" },
        russia: { unavailable: true, reason: "No verified national total" },
        html: `
          <p>OHCHR had verified at least 57,713 civilians injured in Ukraine, including 3,504 children, in the total cited to the Security Council in November 2026. September 2026 accounted for 2,105 of the injured.</p>
          <div class="fragments">
            <article>
              <h4>Ukraine, another count</h4>
              <p>The prosecutor’s office, as of 23 October 2026, reported more than 55,000 civilians injured. The UN figure is higher and is the one used on the bar, because the mission publishes a single running verified total.</p>
            </article>
            <article>
              <h4>Russia, pieces of a total</h4>
              <p>September 2026, Russian authorities via the UN: 462 injured. Belgorod region through late August 2026: 4,460 injured. People have been hurt inside Russia. Nobody has published a verified sum for the whole country.</p>
            </article>
          </div>`,
        sources: [
          ["UN official, Security Council", "https://dppa.un.org/en/speeches-and-statements/remarks-by-director-for-europe-and-central-asia-division-to-the", "November 2026"],
          ["UN press release on the same briefing", "https://press.un.org/en/2026/sc16503.doc.htm", "September figures for Russia"],
          ["Novaya Gazeta, Belgorod", "https://novayagazeta.ru/articles/2026/08/28/eto-referendum-ob-otnoshenii-k", "late August 2026"],
        ],
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure damage",
    intro: "Ukraine has a joint damage survey in dollars. Russia does not. Military spending and a president’s remark about one strike campaign are not substitutes for that survey.",
    views: [
      {
        id: "direct",
        label: "Direct damage",
        ukraine: { low: 195.1, high: 195.1, prefix: "$", note: "through 31 Dec 2025" },
        russia: { unavailable: true, reason: "No national damage survey" },
        html: `
          <p>The fifth Rapid Damage and Needs Assessment, from the Government of Ukraine, the World Bank, the European Commission, and the United Nations, put direct damage to buildings and infrastructure at $195.1 billion as of 31 December 2025. Housing, transport, and energy account for most of it. The Kyiv School of Economics later put damages at $197.5 billion as of February 2026, on the World Bank’s method. The bar uses the joint assessment.</p>
          <div class="sectors">${sectorChart()}</div>
          <div class="callout">
            <h4>Inside Russia</h4>
            <p>On 1 September 2026 President Putin said a 40-day Ukrainian strike campaign had caused preliminary damage of about 1 percent of GDP, and called it not critical. One percent of Russia’s 2025 nominal GDP, about $2.56 trillion, is roughly $26 billion. That is his estimate of one campaign. It is not an inventory of damage since 2022, and this page does not draw it as one.</p>
          </div>`,
        sources: [
          ["World Bank, RDNA5", "https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released", "as of 31 Dec 2025"],
          ["KSE Institute", "https://institute.kse.ua/news/damages-to-ukraines-infrastructure-from-the-war-have-risen-to-197-5-billion-kse-institute-estimate-as-of-february-2026/", "as of February 2026"],
          ["Bloomberg, on Putin’s remark", "https://www.bloomberg.com/news/articles/2026-09-01/putin-says-ukraine-40-day-strike-campaign-cost-russia-1-of-gdp", "1 Sep 2026"],
        ],
      },
    ],
  },
];

const gdp = {
  years: [2021, 2022, 2023, 2024, 2025],
  ukraine: [200, 162, 181, 191, 214],
  russia: [1829, 2292, 2046, 2186, 2561],
};

function sourceList(sources) {
  return `<ul class="sources">${sources.map(([name, url, asOf]) =>
    `<li><a href="${url}">${name}</a> <span class="tag">${asOf}</span></li>`
  ).join("")}</ul>`;
}

function renderSummary() {
  const rows = summary.map((row) => `
    <article class="row">
      <div>
        <h3>${row.title}</h3>
        <p class="basis">${row.basis}</p>
      </div>
      <div>
        ${pairHtml(row)}
      </div>
    </article>`).join("");
  return `
    <section class="summary" aria-labelledby="summary-title">
      <div class="section-head">
        <div>
          <h2 id="summary-title">The comparison</h2>
          <p>Each row names the measurement. Open a category below for the other published figures and the links.</p>
        </div>
      </div>
      <div class="scale-head" aria-hidden="true">
        <span></span>
        <div class="countries"><span>Ukraine</span><span>Russia</span></div>
      </div>
      ${rows}
    </section>`;
}

function renderSection(section) {
  const buttons = section.views.map((view, i) => `
    <button type="button" role="tab" id="${section.id}-${view.id}-tab" aria-controls="${section.id}-${view.id}" aria-selected="${i === 0 ? "true" : "false"}" data-section="${section.id}" data-view="${view.id}">${view.label}</button>`
  ).join("");
  const panels = section.views.map((view, i) => `
    <div class="panel" role="tabpanel" id="${section.id}-${view.id}" aria-labelledby="${section.id}-${view.id}-tab" ${i === 0 ? "" : "hidden"}>
      <div class="countries" aria-hidden="true"><span>Ukraine</span><span>Russia</span></div>
      ${pairHtml(view)}
      <div class="detail">${view.html}</div>
      ${sourceList(view.sources)}
    </div>`).join("");
  const tabs = section.views.length > 1
    ? `<div class="views" role="tablist" aria-label="${section.title} sources">${buttons}</div>`
    : "";
  return `
    <section class="block" id="${section.id}" aria-labelledby="${section.id}-title">
      <header>
        <h2 id="${section.id}-title">${section.title}</h2>
        <p class="intro">${section.intro}</p>
      </header>
      ${tabs}
      ${panels}
    </section>`;
}

function sectorChart() {
  const maxSector = sectors[0][1];
  return sectors.map(([name, value]) => `
    <div class="sector">
      <span>${name}</span>
      <div class="bar"><span style="width:${(value / maxSector) * 100}%"></span></div>
      <b>$${value.toFixed(1)}B</b>
    </div>`).join("");
}

function indexBars(values, tone, maxIndex) {
  const base = values[0];
  return gdp.years.map((year, i) => {
    const index = Math.round((values[i] / base) * 100);
    const width = Math.min(100, (index / maxIndex) * 100);
    return `
      <div class="year ${tone}">
        <span>${year}</span>
        <div class="bar"><span style="width:${width}%"></span></div>
        <span>${index}</span>
      </div>`;
  }).join("");
}

function renderEconomy() {
  return `
    <section class="block" id="economy" aria-labelledby="economy-title">
      <header>
        <h2 id="economy-title">The economies</h2>
        <p class="intro">Damage in dollars and damage to output are different. Ukraine’s physical stock has been surveyed. The hit to each economy shows up in output, the budget, and what reconstruction will cost.</p>
      </header>
      <div class="stats">
        <article>
          <p class="figure">$195 billion</p>
          <p>Direct damage in Ukraine through the end of 2025. About nine-tenths of the country’s 2025 nominal GDP.</p>
        </article>
        <article>
          <p class="figure">$667 billion</p>
          <p>RDNA5 economic and social losses: 64 months already incurred and 18 months projected. Not cash already destroyed.</p>
        </article>
        <article>
          <p class="figure">$588 billion</p>
          <p>Recovery and reconstruction needs for 2026–2035. Almost three times Ukraine’s 2025 nominal GDP.</p>
        </article>
      </div>
      <div class="callout" style="margin-top:1.1rem;">
        <h4>Russia’s war bill is mostly spending</h4>
        <p>SIPRI puts Russia’s military expenditure in the 2025 budget at about 16 trillion rubles, 7.5 percent of GDP, and the budget deficit at 2.6 percent of GDP. The 2026 budget booked 14.9 trillion rubles, 6.3 percent of GDP, and SIPRI expects that plan to be amended. This is money the state chose to spend. It is not a valuation of damaged roads, housing, or refineries. The sector chart above is Ukraine’s direct damage, from the same joint survey.</p>
      </div>
      <div class="gdp" aria-label="Nominal GDP indexed to 2021">
        <div>
          <h3 class="ua-h">Ukraine nominal GDP, 2021 = 100</h3>
          ${indexBars(gdp.ukraine, "ua", 140)}
        </div>
        <div>
          <h3 class="ru-h">Russia nominal GDP, 2021 = 100</h3>
          ${indexBars(gdp.russia, "ru", 140)}
        </div>
      </div>
      <div class="detail">
        <p>The index is current US dollars, so it moves with prices and the exchange rate. It is the wrong chart for “how much is still being produced.” On that question the IMF’s February 2026 staff report is direct: Ukraine’s real GDP in 2025 was about 20 percent below the pre-war level, even though the dollar value of GDP had climbed back above 2021. Russia’s dollar GDP is higher than in 2021. SIPRI describes the wartime expansion as an overheated economy that the central bank then tried to cool, with military outlays still several times a normal peacetime share.</p>
        <p>The OECD’s 2025 survey of Ukraine says about a quarter of the population has been displaced inside the country or abroad. That is an economic fact as well as a human one: workers, tenants, and taxpayers are not where the pre-war economy assumed they would be.</p>
      </div>
      <ul class="sources">
        <li><a href="https://www.worldbank.org/en/news/press-release/2026/02/23/updated-ukraine-recovery-and-reconstruction-needs-assessment-released">World Bank, RDNA5 press release</a> <span class="tag">Feb 2026</span></li>
        <li><a href="https://documents1.worldbank.org/curated/en/099022026094036395/pdf/P51449922f93f3a-4278-42bc-b907-db9553d12069.pdf">RDNA5 full report</a> <span class="tag">$195.1B, $666.7B, $587.7B</span></li>
        <li><a href="https://www.imf.org/-/media/files/publications/cr/2026/english/1ukrea2026001-source-pdf.pdf">IMF Country Report No. 26/058</a> <span class="tag">real GDP about 20% below pre-war</span></li>
        <li><a href="https://www.sipri.org/sites/default/files/2026-03/2026_01_russias_military_budget_for_2026.pdf">SIPRI, Russia’s military budget for 2026</a> <span class="tag">Mar 2026</span></li>
        <li><a href="https://georank.org/economy/russia/ukraine">Nominal GDP series, current dollars</a> <span class="tag">2021–2025</span></li>
        <li><a href="https://www.oecd.org/en/publications/oecd-economic-surveys-ukraine-2025_940cee85-en.html">OECD Economic Survey: Ukraine 2025</a> <span class="tag">about a quarter displaced</span></li>
      </ul>
    </section>
    <section class="block" id="gaps" aria-labelledby="gaps-title">
      <header>
        <h2 id="gaps-title">What this page will not pretend to know</h2>
      </header>
      <ul class="note-list">
        <li>Equipment losses. Visually confirmed vehicle counts exist, but they are a different project from the dollar damage survey, and they are not included here.</li>
        <li>A national civilian casualty total for Russia. Monthly official claims and one region’s tally are shown as fragments.</li>
        <li>A count of Russian wounded separate from the dead. The General Staff’s daily personnel figure mixes the killed and the severely wounded.</li>
        <li>A single “true” death toll. Where serious sources disagree, the disagreement is the figure.</li>
      </ul>
    </section>`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function longDay(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// Morning briefing of date D reports the previous calendar day.
// 17 October has no 08:00 text post; that figure is the +2,090 on the sheet dated through 18 October.
const generalStaffDaily = [
  ["2026-10-01", 1520, 42441],
  ["2026-10-02", 1560, 42453],
  ["2026-10-03", 1750, 42466],
  ["2026-10-04", 2020, 42473],
  ["2026-10-05", 1540, 42488],
  ["2026-10-06", 1690, 42494],
  ["2026-10-07", 1830, 42516],
  ["2026-10-08", 1710, 42529],
  ["2026-10-09", 1420, 42546],
  ["2026-10-10", 1930, 42561],
  ["2026-10-11", 1470, 42568],
  ["2026-10-12", 1390, 42575],
  ["2026-10-13", 1650, 42587],
  ["2026-10-14", 1880, 42594],
  ["2026-10-15", 1790, 42603],
  ["2026-10-16", 1950, 42611],
  ["2026-10-17", 2090, 42617],
  ["2026-10-18", 2100, 42625],
  ["2026-10-19", 1560, 42633],
  ["2026-10-20", 1820, 42640],
  ["2026-10-21", 2250, 42652],
  ["2026-10-22", 1830, 42660],
  ["2026-10-23", 1980, 42675],
  ["2026-10-24", 1850, 42683],
  ["2026-10-25", 1990, 42689],
  ["2026-10-26", 1400, 42698],
  ["2026-10-27", 1510, 42718],
  ["2026-10-28", 1560, 42725],
  ["2026-10-29", 1590, 42733],
  ["2026-10-30", 1670, 42741],
  ["2026-10-31", 2100, 42747],
  ["2026-11-01", 2500, 42766],
  ["2026-11-02", 2060, 42784],
  ["2026-11-03", 2180, 42802],
  ["2026-11-04", 2380, 42815],
  ["2026-11-05", 2440, 42823],
  ["2026-11-06", 2280, 42830],
  ["2026-11-07", 2290, 42837],
  ["2026-11-08", 2980, 42846],
  ["2026-11-09", 2220, 42855],
  ["2026-11-10", 2580, 42862],
  ["2026-11-11", 2150, 42875],
  ["2026-11-12", 2590, 42882],
  ["2026-11-13", 1710, 42891],
  ["2026-11-14", 2230, 42908],
  ["2026-11-15", 2560, 42915],
];

function renderGeneralStaff() {
  const max = Math.max(...generalStaffDaily.map((row) => row[1]));
  const bars = generalStaffDaily.map(([day, n, post]) => {
    const peak = n === max ? " peak" : "";
    const height = Math.max(2, (n / max) * 100);
    return `<div class="${peak.trim()}" title="${longDay(day)}: ${count.format(n)}"><span class="stem" style="height:${height}%"></span></div>`;
  }).join("");
  const rows = generalStaffDaily.map(([day, n, post]) => `
    <tr class="${n === max ? "peak" : ""}">
      <td>${longDay(day)}</td>
      <td>${count.format(n)}</td>
      <td><a href="https://t.me/GeneralStaffZSU/${post}">Post ${post}</a></td>
    </tr>`).join("");
  const windowSum = generalStaffDaily.reduce((sum, row) => sum + row[1], 0);
  return `
    <section class="block" id="general-staff" aria-labelledby="general-staff-title">
      <header>
        <h2 id="general-staff-title">Each day, as the General Staff claims it</h2>
        <p class="intro">The Ukrainian General Staff posts a personnel figure every morning. The sheet calls the running total approximate personnel losses. The <a href="https://t.me/GeneralStaffZSU/42849">9 November post</a> calls that day’s 2,980 “killed and severely wounded.” It is one side’s claim, and it is not a count of the dead alone, so it is not drawn against the death estimates above.</p>
      </header>
      <div class="stats">
        <article class="ru-stat">
          <p class="figure">2,980</p>
          <p>8 November, the day described in the 9 November post. The General Staff called it the largest day of the war. The earlier mark it mentioned, 2,500, is the 1 November figure, recorded in the 2 November briefing.</p>
        </article>
        <article class="ru-stat">
          <p class="figure">About 1,625,420</p>
          <p>Cumulative personnel on the sheet dated through 16 November 2026, including that morning’s addition of 2,560 for 15 November.</p>
        </article>
        <article class="ru-stat">
          <p class="figure">400,410</p>
          <p>Personnel losses in 2026, as stated on the morning of 9 November. That sentence is not a later update.</p>
        </article>
      </div>
      <div class="daily" aria-hidden="true">${bars}</div>
      <div class="day-scale" aria-hidden="true"><span>1 October</span><span>15 November</span></div>
      <p class="basis">Daily claims from 1 October through 15 November 2026. Each bar is the figure in the next morning’s 08:00 briefing. Those seven briefings for 1–7 November add up to 16,130, the total the General Staff published for that week. The dark bar is 8 November.</p>
      <table class="days">
        <caption class="basis">Forty-six days. 17 October is read from the losses sheet, because that morning’s text briefing was not posted. Every other row is the text briefing.</caption>
        <thead>
          <tr><th>Day</th><th>Personnel</th><th>Source post</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="basis">These ${count.format(windowSum)} personnel are the sum of this window only. They are already inside the cumulative sheet, not an addition to it.</p>
      <ul class="sources">
        <li><a href="https://t.me/GeneralStaffZSU/42849">General Staff, 9 November post</a> <span class="tag">2,980 killed and severely wounded</span></li>
        <li><a href="https://t.me/GeneralStaffZSU/42846">Morning briefing, 9 November</a> <span class="tag">2,980 persons for the previous day</span></li>
        <li><a href="https://t.me/GeneralStaffZSU/42914">Losses sheet through 16 November</a> <span class="tag">about 1,625,420 personnel, +2,560</span></li>
        <li><a href="https://t.me/GeneralStaffZSU/42915">Morning briefing, 16 November</a> <span class="tag">2,560 persons for 15 November</span></li>
      </ul>
    </section>`;
}

function bindTabs() {
  document.querySelectorAll(".views button").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      document.querySelectorAll(`.views button[data-section="${section}"]`).forEach((peer) => {
        peer.setAttribute("aria-selected", peer === button ? "true" : "false");
      });
      document.querySelectorAll(`#${section} .panel`).forEach((panel) => {
        panel.hidden = panel.id !== `${section}-${button.dataset.view}`;
      });
    });
  });
}

const main = document.querySelector("main");
main.innerHTML = renderSummary() + sections.map((section) => renderSection(section) + (section.id === "military-deaths" ? renderGeneralStaff() : "")).join("") + renderEconomy();
bindTabs();
