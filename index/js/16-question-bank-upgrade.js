(function () {
  const LETTERS = ['A', 'B', 'C', 'D'];

  function makeChoices(correct, wrong, preferredIndex) {
    const choices = {};
    const ordered = new Array(4);
    const target = preferredIndex % 4;
    ordered[target] = String(correct);
    wrong.slice(0, 3).forEach((value, i) => {
      let slot = i;
      if (slot >= target) slot += 1;
      ordered[slot] = String(value);
    });
    LETTERS.forEach((letter, i) => { choices[letter] = ordered[i]; });
    return { c: choices, a: LETTERS[target] };
  }

  function satQuestion(cat, passage, prompt, correct, wrong, explanation, index) {
    return {
      cat,
      passage,
      q: prompt,
      ...makeChoices(correct, wrong, index),
      e: explanation
    };
  }

  function mathQuestion(cat, prompt, correct, wrong, explanation, index) {
    return {
      cat,
      q: prompt,
      ...makeChoices(correct, wrong, index),
      e: explanation
    };
  }

  function rebalanceAnswers(bank, offset) {
    if (!Array.isArray(bank)) return;
    let mcIndex = 0;
    bank.forEach((q, i) => {
      if (!q || !q.c || !q.a || !q.c[q.a]) return;
      const correctText = q.c[q.a];
      const wrong = LETTERS.filter(l => l !== q.a).map(l => q.c[l]).filter(v => v != null);
      const rebuilt = makeChoices(correctText, wrong, mcIndex + offset);
      q.c = rebuilt.c;
      q.a = rebuilt.a;
      mcIndex += 1;
    });
  }

  function buildEnglishBank() {
    const scenarios = [
      {
        cat: 'Command of Evidence',
        subject: 'urban tree canopy studies',
        passage: 'A city planning team compared summer temperatures across twelve neighborhoods. Blocks with mature street trees averaged 4.8 degrees Fahrenheit cooler than nearby blocks with similar building density but little shade. However, the team also found that wealthier neighborhoods had both more trees and newer building materials, making it difficult to isolate which factor most reduced heat exposure.',
        claim: 'tree canopy itself reduces neighborhood heat exposure',
        support: 'A follow-up comparison of blocks with the same building age and roof materials found that the blocks with mature street trees were still significantly cooler.',
        trap1: 'Residents of tree-lined blocks reported that they liked the appearance of their streets more than residents of blocks without trees.',
        trap2: 'The city planted more trees in high-income neighborhoods than in low-income neighborhoods during the previous decade.',
        trap3: 'Neighborhoods with more trees tended to have slightly lower traffic volume during the morning commute.',
        explain: 'The strongest evidence controls for the alternative explanation named in the passage: building materials. Once that variable is held constant, the tree canopy effect is more credible.'
      },
      {
        cat: 'Command of Evidence',
        subject: 'sleep and memory consolidation',
        passage: 'Neuroscientists studying memory found that students who reviewed vocabulary immediately before sleep remembered more words the next morning than students who reviewed the same list after waking. The researchers cautioned, though, that the result might reflect differences in distraction rather than a special role for sleep in memory consolidation.',
        claim: 'sleep after studying improves memory consolidation',
        support: 'When both groups studied in identical distraction-free rooms, the group that slept immediately after studying still recalled more words.',
        trap1: 'Students in both groups reported that they were familiar with some vocabulary words before the experiment began.',
        trap2: 'Students who studied in the morning completed the task faster than students who studied at night.',
        trap3: 'The vocabulary list included abstract nouns, concrete nouns, and several technical terms.',
        explain: 'The best evidence removes the distraction alternative while preserving the sleep timing difference.'
      },
      {
        cat: 'Text Structure',
        subject: 'two accounts of a scientific discovery',
        passage: 'Text 1: The discovery of pulsars is often presented as a triumph of institutional science because it depended on a large radio telescope project and years of technical preparation. Text 2: That account is incomplete. Jocelyn Bell Burnell noticed the unusual signal because she personally examined long paper readouts with unusual patience; without that individual attention, the instrument might have produced data no one understood.',
        claim: 'Text 2 revises Text 1 by emphasizing individual interpretation',
        support: 'Text 2 does not deny the importance of the instrument; it argues that the instrument mattered only because a researcher recognized the signal in its output.',
        trap1: 'Text 2 argues that the telescope project was unnecessary because discoveries are always made by individuals rather than institutions.',
        trap2: 'Text 2 agrees entirely with Text 1 and adds a second example of institutional scientific success.',
        trap3: 'Text 2 shifts from astronomy to chemistry in order to challenge the reliability of large research projects.',
        explain: 'Text 2 qualifies the institutional account by adding the interpretive role of a person reading the data.'
      },
      {
        cat: 'Rhetorical Synthesis',
        subject: 'student notes about bilingual education',
        passage: 'Notes: Dual-language programs teach academic content in two languages. Some studies find that students in these programs initially progress more slowly in English reading. By middle school, many dual-language students outperform peers in English-only programs. Researchers suggest that sustained bilingual instruction strengthens metalinguistic awareness, or the ability to think about how language works.',
        claim: 'emphasize the long-term academic benefit while acknowledging the short-term tradeoff',
        support: 'Although dual-language students may show slower English reading growth at first, research suggests that the programs can produce stronger middle-school outcomes by developing metalinguistic awareness.',
        trap1: 'Dual-language programs should replace English reading instruction because students in those programs never struggle with literacy.',
        trap2: 'Researchers have not studied dual-language programs enough to reach any conclusion about their academic effects.',
        trap3: 'Metalinguistic awareness is the ability to speak two languages at home and in school.',
        explain: 'The correct synthesis includes both the early tradeoff and the later benefit without overstating either.'
      },
      {
        cat: 'Vocabulary in Context',
        subject: 'public health messaging',
        passage: 'The public health campaign avoided alarmist language. Instead of predicting catastrophe, it presented concrete actions residents could take, a choice intended to make the recommendations seem practical rather than __________.',
        claim: 'needlessly frightening',
        support: 'dire',
        trap1: 'meticulous',
        trap2: 'feasible',
        trap3: 'tentative',
        explain: 'Dire means extremely serious or frightening, which contrasts with practical, action-focused advice.'
      },
      {
        cat: 'Grammar & Usage',
        subject: 'modifier placement',
        passage: 'After examining satellite images from three decades, __________ that the coastline had retreated most rapidly near river deltas where sediment flow had been reduced by dams.',
        claim: 'complete the sentence with a clear subject',
        support: 'the researchers concluded',
        trap1: 'a conclusion was reached by the researchers',
        trap2: 'it was concluded by the researchers',
        trap3: 'the coastline was concluded by researchers',
        explain: 'The introductory phrase describes who examined the images, so the main clause should begin with that subject: the researchers.'
      },
      {
        cat: 'Command of Evidence',
        subject: 'artisan markets and tourism',
        passage: 'An economist argued that weekend artisan markets help small towns retain young adults by creating low-cost opportunities to test business ideas. Critics replied that markets mostly attract tourists and do little for year-round residents.',
        claim: 'artisan markets support local entrepreneurship among young adults',
        support: 'Town licensing records showed that 38 percent of permanent storefront businesses opened by residents under thirty-five had begun as weekend market stalls.',
        trap1: 'Hotel occupancy was higher on weekends when the artisan market was open.',
        trap2: 'Tourists spent more money at food stalls than at craft stalls during the summer.',
        trap3: 'Some residents complained that downtown parking was harder to find on market days.',
        explain: 'The correct evidence directly links market stalls to later permanent local businesses run by young adults.'
      },
      {
        cat: 'Text Structure',
        subject: 'ecosystem restoration',
        passage: 'The author first describes the collapse of oyster reefs in a coastal bay, then explains how the loss of reefs worsened erosion, reduced water clarity, and damaged fish habitats. The final paragraph describes a restoration project that rebuilds reefs not simply to protect oysters but to restore several connected ecological functions.',
        claim: 'identify the passage structure',
        support: 'It presents a problem, explains cascading consequences, and then describes a restoration effort aimed at the broader system.',
        trap1: 'It compares two unrelated ecosystems and argues that both should be managed in the same way.',
        trap2: 'It lists several restoration techniques but avoids making a claim about which one is best.',
        trap3: 'It narrates the life cycle of a single species from reproduction to maturity.',
        explain: 'The passage moves from problem to consequences to system-level solution.'
      }
    ];

    const bank = [];
    for (let i = 0; i < 96; i++) {
      const s = scenarios[i % scenarios.length];
      const variant = Math.floor(i / scenarios.length) + 1;
      let passage = s.passage;
      let prompt = '';
      let correct = s.support;
      let wrong = [s.trap1, s.trap2, s.trap3];
      if (s.cat === 'Vocabulary in Context') {
        prompt = 'Which choice completes the text with the most logical and precise word or phrase?';
      } else if (s.cat === 'Grammar & Usage') {
        prompt = 'Which choice completes the text so that it conforms to the conventions of Standard English?';
      } else if (s.cat === 'Rhetorical Synthesis') {
        prompt = 'The student wants to ' + s.claim + '. Which choice best uses the notes to accomplish this goal?';
      } else if (s.cat === 'Text Structure') {
        prompt = 'Which choice best describes the structure or relationship presented in the text?';
      } else {
        prompt = 'Which finding, if true, would most directly support the claim that ' + s.claim + '?';
      }
      if (variant > 1 && (s.cat === 'Command of Evidence' || s.cat === 'Text Structure')) {
        passage += ' A later review asked whether the original interpretation had separated correlation from causation and whether the comparison groups were truly similar.';
      }
      bank.push(satQuestion(
        s.cat,
        passage,
        prompt,
        correct,
        wrong,
        s.explain + ' This is the kind of reasoning the SAT rewards: match the exact claim, not merely the topic.',
        i
      ));
    }
    return bank;
  }

  function buildMathBank() {
    const bank = [];
    let idx = 0;

    for (let i = 0; i < 34; i++, idx++) {
      const adult = 18 + (i % 7) * 2;
      const student = 9 + (i % 5);
      const totalTickets = 42 + (i % 9) * 3;
      const revenue = adult * (18 + (i % 8)) + student * (totalTickets - (18 + (i % 8)));
      const adults = Math.round((revenue - student * totalTickets) / (adult - student));
      bank.push(mathQuestion(
        'Linear Equations',
        `At a museum fundraiser, adult tickets cost $${adult} and student tickets cost $${student}. A total of ${totalTickets} tickets were sold, and the revenue was $${revenue}. If a represents the number of adult tickets sold, which value of a satisfies the conditions?`,
        adults,
        [adults - 4, adults + 3, totalTickets - adults],
        `Use the system a + s = ${totalTickets} and ${adult}a + ${student}s = ${revenue}. Substitute s = ${totalTickets} - a, then solve for a.`,
        idx
      ));
    }

    for (let i = 0; i < 32; i++, idx++) {
      const r1 = 2 + (i % 9);
      const r2 = r1 + 3 + (i % 4);
      const a = 1 + (i % 3);
      const b = -a * (r1 + r2);
      const c = a * r1 * r2;
      const sum = r1 + r2;
      bank.push(mathQuestion(
        'Advanced Math',
        `The quadratic function f is defined by f(x) = ${a}x^2 ${b < 0 ? '- ' + Math.abs(b) : '+ ' + b}x + ${c}. The graph of y = f(x) intersects the x-axis at two points. What is the sum of the x-coordinates of those two points?`,
        sum,
        [sum - 2, -sum, r1 * r2],
        `For ax^2 + bx + c, the sum of the roots is -b/a. Here that gives ${sum}.`,
        idx
      ));
    }

    for (let i = 0; i < 30; i++, idx++) {
      const n = 40 + i;
      const oldMean = 68 + (i % 12);
      const newScores = [82 + (i % 7), 88 + (i % 5), 91 + (i % 4)];
      const newMean = ((n * oldMean + newScores.reduce((a, b) => a + b, 0)) / (n + 3)).toFixed(1);
      bank.push(mathQuestion(
        'Data Analysis',
        `A biology teacher recorded a class mean of ${oldMean} after ${n} lab reports. Three late reports with scores ${newScores.join(', ')}, respectively, were then added to the data set. What is the new class mean?`,
        newMean,
        [(Number(newMean) + 1.5).toFixed(1), (Number(newMean) - 1.2).toFixed(1), (oldMean + 3).toFixed(1)],
        `Convert the original mean to a total: ${n} x ${oldMean}. Add the three late scores, then divide by ${n + 3}.`,
        idx
      ));
    }

    for (let i = 0; i < 28; i++, idx++) {
      const radius = 3 + (i % 6);
      const height = 8 + (i % 9);
      const scale = 2 + (i % 3);
      const ratio = scale ** 3;
      bank.push(mathQuestion(
        'Geometry',
        `A right circular cylinder has radius ${radius} and height ${height}. A similar cylinder is created by multiplying every linear dimension by ${scale}. The volume of the larger cylinder is how many times the volume of the original cylinder?`,
        ratio,
        [scale, scale ** 2, ratio + scale],
        `For similar solids, volume scales by the cube of the linear scale factor. The factor is ${scale}^3 = ${ratio}.`,
        idx
      ));
    }

    return bank;
  }

  function addApushStimulusQuestions() {
    if (!Array.isArray(window.BANK) && typeof BANK === 'undefined') return;
    const target = Array.isArray(window.BANK) ? window.BANK : BANK;
    const additions = [];
    const periodTopics = [
      [1, 'Period 1: 1491-1607', 'Spanish officials repeatedly described Native labor as necessary for conversion and imperial order, while critics argued that coercion made genuine conversion impossible.', 'Spanish colonization combined religious justification with forced labor systems that produced sharp moral and political criticism.'],
      [2, 'Period 2: 1607-1754', 'A colonial governor complained that frontier settlers demanded military protection while coastal elites resisted higher taxes and tried to preserve profitable trade relations.', 'Colonial politics often exposed tensions between frontier security demands and coastal elite economic interests.'],
      [3, 'Period 3: 1754-1800', 'A pamphleteer argued that representation was meaningless if a distant legislature could tax colonists without their consent and station troops among them in peacetime.', 'Revolutionary ideology linked taxation, consent, standing armies, and fears of arbitrary power.'],
      [4, 'Period 4: 1800-1848', 'A reformer wrote that public schools would make republican citizenship possible by teaching discipline, literacy, and shared civic habits to children from different classes.', 'Common-school reformers saw education as a tool for social order and democratic citizenship.'],
      [5, 'Period 5: 1844-1877', 'An antislavery newspaper argued that the expansion of slavery into western territories would degrade free labor by giving plantation owners political control over land and opportunity.', 'Free Soil arguments opposed slavery expansion because it threatened white free labor and western opportunity.'],
      [6, 'Period 6: 1865-1898', 'A steel executive defended vertical integration as efficient coordination, while a labor organizer described the same system as a way to control workers and crush bargaining power.', 'Industrial capitalism produced competing interpretations of efficiency, monopoly power, and labor exploitation.'],
      [7, 'Period 7: 1890-1945', 'A New Deal administrator argued that federal relief should restore purchasing power immediately, not wait for private charity or local governments overwhelmed by unemployment.', 'The New Deal expanded federal responsibility for economic stabilization and social welfare.'],
      [8, 'Period 8: 1945-1980', 'A civil rights strategist explained that televised images of peaceful protesters facing violence forced national audiences to confront the gap between democratic ideals and segregation.', 'Civil rights activists used media visibility and nonviolent protest to pressure federal action.'],
      [9, 'Period 9: 1980-Present', 'A policy memo argued that globalization lowered consumer prices but also made industrial workers vulnerable to plant relocation and wage competition.', 'Late twentieth-century globalization created both consumer benefits and deindustrialization pressures.']
    ];
    periodTopics.forEach(([p, pl, text, answer], i) => {
      additions.push({
        p,
        pl,
        stimulus: { type: 'excerpt', source: 'Historical interpretation set ' + (i + 1), text },
        q: 'Which broader historical development is most directly illustrated by the excerpt?',
        ...makeChoices(answer, [
          'The complete disappearance of regional conflict from American political life',
          'The replacement of political disagreement with a national consensus on economic policy',
          'The decline of government influence over social and economic change'
        ], i + 1),
        e: answer + ' The excerpt points to this broader development by connecting a specific source perspective to a larger APUSH theme.'
      });
    });
    target.push(...additions);
  }

  function updateCounts() {
    const satTotal = (window.SAT_ENG?.length || 0) + (window.SAT_MATH?.length || 0);
    document.querySelectorAll('.bc-pill, .bc-stat-num, .bc-hero-metric span, .bc-stat-cell .bc-stat-num').forEach(el => {
      if (/485_QUESTIONS|SAT_QUESTIONS|366\+/.test(el.textContent || '')) return;
    });
    const satPills = [...document.querySelectorAll('.bc-pill')].filter(el => /485_QUESTIONS/.test(el.textContent || ''));
    satPills.forEach(el => { el.textContent = satTotal + '_SAT_QUESTIONS'; });
    const apushPills = [...document.querySelectorAll('.bc-pill')].filter(el => /200\+_QUESTIONS/.test(el.textContent || ''));
    apushPills.forEach(el => { el.textContent = (window.BANK?.length || (typeof BANK !== 'undefined' ? BANK.length : 0)) + '+_APUSH_QUESTIONS'; });
  }

  window.SAT_ENG.splice(0, window.SAT_ENG.length, ...buildEnglishBank());
  window.SAT_MATH.splice(0, window.SAT_MATH.length, ...buildMathBank());
  if (typeof SAT_ENG !== 'undefined' && SAT_ENG !== window.SAT_ENG) SAT_ENG.splice(0, SAT_ENG.length, ...window.SAT_ENG);
  if (typeof SAT_MATH !== 'undefined' && SAT_MATH !== window.SAT_MATH) SAT_MATH.splice(0, SAT_MATH.length, ...window.SAT_MATH);

  addApushStimulusQuestions();
  rebalanceAnswers(window.SAT_ENG, 0);
  rebalanceAnswers(window.SAT_MATH, 1);
  if (typeof BANK !== 'undefined') rebalanceAnswers(BANK, 2);
  if (window.BANK && window.BANK !== (typeof BANK !== 'undefined' ? BANK : null)) rebalanceAnswers(window.BANK, 2);

  window.__SAT_BANK_COUNTS__ = { english: window.SAT_ENG.length, math: window.SAT_MATH.length };
  document.addEventListener('DOMContentLoaded', updateCounts);
  if (document.readyState !== 'loading') updateCounts();
})();
