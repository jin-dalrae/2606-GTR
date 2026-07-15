# RESEARCH REPORT & CLEANED TRANSCRIPT: Climatico Midterm Expo (July 13, 2026)

> **Research page:** [site/research/midterm-expo/](../site/research/midterm-expo/) — synthesis, pillars, quotes, and design implications for the multipage site.

## 0. Transcript cleaning QA (Gemini vs raw ASR)

**Verdict:** Good enough for research synthesis and product decisions. Not a verbatim court transcript.

### Cleaned well
- Product name → Climatico; metrics → tCO₂e, EI / EI intensity.
- Sensible ASR repairs: *Momala* → mobile; *peach data* → pitch deck; *hoop them / fester* → hook them first; *radio capital* → redefining capital; *public therapy* → public / accelerator directors.
- Denise’s “how / repository / Monday morning” monologue preserves substance and tone.
- Theme-based parts beat raw chronological floor noise for design use.
- Dropped sleep-lock screens, photo logistics, and pure small talk appropriately.

### Be careful
- **Over-polish / invented precision:** e.g. cleaned Presenter lines cite GHG Protocol Scope boundaries; the raw exchange was vaguer. Treat technical methodology lines as team interpretation, not visitor-quoted fact.
- **Speaker labels:** raw rarely names visitors. Leslie / Denise / Vic etc. are useful personas, not hard IDs.
- **Truncation:** Part 2 (Ted) is short vs a longer live pitch cycle; some mid-floor repeats collapsed (fine) but intermediate critiques may be lost.
- **Still-fuzzy ASR** that Gemini guessed: e.g. *fully shunen… dog* → “honest baseline”; *stack of bounder* → founder dashboard aggregate — plausible, not certain.
- **Team debrief at end** (posters as conference handouts, testing the starting point, Elena note) is thin or missing — keep the raw for internal retro.
- **Occasional over-flattering Presenter replies** are reconstructed politeness, not literal.

---

## 1. Overview of the Expo
On July 13, 2026, Team GTR presented *Climatico* at the Midterm Expo. The presentation materials included the landscape tabloid poster series and the interactive digital prototype on three monitors. The session attracted a diverse cohort of founders, venture capitalists, design educators, and peers, yielding highly strategic feedback. 

---

## 2. Participant Profile & Feedback Mapping
The participant mappings from the expo are aligned below:

| Name | Role / Persona | Core Critique Angle |
| :--- | :--- | :--- |
| **Leslie** | Investor / Critic | **Information Architecture & Density**: Expressed high friction toward text-heavy, high-density dashboard layouts ("scares me... too much data all at once"). |
| **Ted** | Tech Visitor | **Ecosystem Navigation**: Explored how accelerators and incubators can propagate Climatico's metrics to make sustainable development operational from day one. |
| **Denise** | The Pragmatic Founder | **Monday Morning Actionability ("The How")**: Pushed hard on transforming abstract data points into prescriptive operations ("Don't just tell me the action. Tell me *how* to do the action. Give me a link..."). |
| **Harshit** | SaaS / Audit Critic | **Data Feasibility**: Raised questions about SaaS data collection friction, specifically highlighting the challenge of tracing cloud/AI compute and the utility of API integrations. |
| **Neha** | Corporate Communications | **Jargon & Nomenclature**: Flagged that "EI" is universally recognized as *Emotional Intelligence* outside climate spaces, and recommended explicit definitions. |
| **Vic** | Investor / VC Persona | **Business Value ("The Bottom Line")**: Challenged the business case ("Why should I care as a business owner? How does it affect my cost or revenue?"). |
| **Katya** | Visual Designer / Peer | **Micro-Interactions & Styling**: Highlighted onboarding layout strength, but urged adding semantic icons to reduce cognitive load and avoid large blocks of raw text. |
| **Marc** | Editorial / Publication Designer | **Media & Communication**: Critiqued the tabloid poster layout as "looking too academic" and recommended digital publication design patterns. |

---

## 3. Key Synthesized Insights

### A. The "Monday Morning Actionability" Gap (Denise’s Pillar)
The most critical realization of the expo was that displaying carbon accounting math is only half the battle. Founders do not just want to see a number; they need a **playbook**. Telling a founder to "reduce cloud emissions" is useless unless accompanied by a link, a vendor recommendation, or an actionable task.
*   **The Repository Model**: Climatico must serve as an operational directory, providing direct, external resource links (articles, guides, tooling) that the founder can immediately assign to team members.

### B. Business Value Alignment (Vic’s Pillar)
Climate-focused founders are inherently mission-driven, but operational decisions ultimately run on the bottom line. 
*   **Correlation of Cost to Carbon**: Climatico must explicitly tie emissions reductions to financial savings (e.g., switching cloud regions to reduce carbon *and* optimize server spend, or choosing remote policies to cut lease costs).

### C. Information Architecture & Density (Leslie & Katya’s Pillar)
The dashboard and poster designs are highly comprehensive but risk inducing "cognitive overload."
*   **Progressive Disclosure**: High-level metrics should dominate the primary views, with secondary detail panels hidden behind expanders or tooltips.
*   **Iconography over Copy**: Text blocks must be replaced with semantic, clean visual icons to create an intuitive, less intimidating flow.

### D. The Jevons & Nomenclature Clash (Neha & Marc’s Pillar)
*   **Nomenclature Clash**: "EI" was repeatedly misread as *Emotional Intelligence*. We must explicitly clarify that **EI stands for Environmental Impact** on first use.
*   **Publication Layouts**: Tabloid posters should move away from dense academic grids and incorporate more dynamic publication layout patterns (e.g., *The New York Times* digital style) utilizing rich negative space and imagery.

---

## 4. Cleaned Transcript (Part by Part)

### PART 1: The Information Architecture Critique
**Speakers**: **Leslie** (Investor/Critic), **Gabriel** (Team GTR), and **Presenter** (Team GTR)

> **Presenter**: Oh, if you look here, this is the onboarding stage. You can actually onboard with your mobile phone because mobile is the easiest entry point for us to hook people in. This is also about showing the slides. If you can follow along here...
> 
> **Leslie**: Ah, yes.
> 
> **Presenter**: Yeah, this is the dashboard. Actually, the first dashboard you see as a startup founder aggregates how your business is currently running, what kind of environmental impact it has, and how that is cascaded down based on your business stage. It's facilitated by your standard payment metrics, so it matches your growth stage. This visual shows what kind of behavior change we can drive.
> 
> **Leslie**: I see. So when founders in your cohort start onboarding, will all that information mostly be visible to the public or the accelerator directors?
> 
> **Presenter**: Together, both parties work toward building a highly sustainable company. At the end of their journey in the accelerator, they pitch their metrics to investors. In the dashboard we showed earlier, that's what we call "redefining capital." It's actually looking at the system as a whole. Together, with these metrics, people can start making operations-first climate decisions. Even if the data isn't fully verified yet, at least it's an honest baseline.
> 
> **Leslie**: Yeah, and especially for investors, as they keep looking at future deals, they will always have this data on hand. Can you explain to me how the data is gathered into the dashboard? How is it reported?
> 
> **Presenter**: For the first-time user, because we want to hook them first with immediate value, we parse their public website data or their uploaded pitch deck. That is subjective, unstructured data, but we use it to estimate their initial environmental impact. Later, once they onboard and create an account, they get a full dashboard. Then we let them connect operational tools. For example, you can connect your Salesforce or accounting software directly.
> 
> **Leslie**: So when you say "we," you mean your product as a service?
> 
> **Presenter**: Yes, exactly.
> 
> **Leslie**: Okay, cool. Awesome, that's great. My only real feedback is that it feels like a lot of data all at once. I wonder how much you are able to play with the information architecture. For me, this is quite overwhelming and a bit scary! Now, keep in mind I'm not your typical instructor or target audience—I don't typically review climate pitch decks, so maybe this is what they look like all the time. But for me, this is just so much text to parse.
> 
> **Presenter**: Understood, that makes total sense. We will definitely look into grouping and simplifying the visual hierarchy. Thank you so much!

---

### PART 2: The Secret Agent / Pitch Deck Friction
**Speakers**: **Ted** (Tech Visitor), **Gabriel** (Team GTR), and **Presenter** (Team GTR)

> **Ted**: Hello! Hey, how are you? Isn't Tash part of your group?
> 
> **Presenter**: Oh, he had to take care of some office matters. It's a secret! No, not the social security office, he's acting like a secret agent today! How are you?
> 
> **Ted**: I am good! What is your service?
> 
> **Presenter**: We are Climatico. We offer an impact-accounting dashboard for early-stage startups to help them scale up sustainably from day one.
> 
> **Ted**: What am I looking at on the screen?
> 
> **Presenter**: This is our concept poster showing how our +/- net impact model is structured. You can actually try the live demo right here. Gabriel will guide you through it.
> 
> **Gabriel**: Yes, imagine you are a startup founder. The very first thing you'll experience is this guided onboarding flow...

---

### PART 3: Explaining "EI" and "EI Intensity"
**Speakers**: **Denise** (Visitor/Founder), **Gabriel** (Team GTR), and **Presenter** (Team GTR)

> **Denise**: Hi, how are you?
> 
> **Presenter**: Good, how are you? We are Climatico. We provide a net-impact dashboard for early-stage startups. Even if you are just in the idea or pre-seed stage, we give you a clear path to scale up sustainably from day one. Because startups scale so rapidly, we shouldn't lose the window of opportunity to intervene early in their operational choices.
> 
> **Denise**: Okay.
> 
> **Presenter**: We analyze their operating model and estimate what kind of environmental impact they will have—where they are emitting versus where they are avoiding emissions. We cascade this by their funding stage.
> 
> **Denise**: I see.
> 
> **Presenter**: So we display both historical snapshots and future estimations. We offer actionable insights, like: "Your business model relies heavily on cloud compute or manufacturing that emits a lot of CO₂, so you should consider optimizing it this way."
> 
> **Denise**: Oh, so the tool recommends specific changes based on environmental performance?
> 
> **Presenter**: Yes, absolutely. And you get continuous tracking of your Environmental Impact (EI) metrics to hit your climate goals.
> 
> **Denise**: What does **tCO₂e** stand for on this card?
> 
> **Presenter**: That is tonnes of carbon dioxide equivalent—the standard metric for greenhouse gases.
> 
> **Denise**: Okay, I see.
> 
> **Presenter**: We focus heavily on **EI** (Environmental Impact) and **EI Intensity**. EI is your absolute footprint, but EI Intensity divides that footprint by your company's revenue. If you only look at absolute emissions, a tiny startup looks "clean" simply because they are small, but they might be incredibly inefficient. We must always track intensity to measure true performance during scaling.

---

### PART 4: Harshit’s Auditing & Motivation Critique
**Speakers**: **Harshit** (SaaS Founder) and **Presenter** (Team GTR)

> **Harshit**: What is the actual motivation for an early-stage startup to pay attention to this or pay for it?
> 
> **Presenter**: If you become a large enterprise later, you are legally obligated to report ESG indexes and carbon disclosures. But early-stage startups have no such regulatory mandate. However, on their way to scaling, if they set up their infrastructure incorrectly, they embed massive carbon liabilities. A software startup might scale its user base 100x and suddenly realize their remote data servers are emitting massive amounts of carbon. We intervene early so they can build a clean foundation.
> 
> **Harshit**: Do you have any local data in San Francisco on how many current startups or mid-sized companies are actually struggling to gather this data or facing trouble because of it?
> 
> **Presenter**: Currently, early-stage startups aren't obligated to report this, so most completely ignore it. Especially for software/AI startups, they rely entirely on remote data centers and have no idea what their server carbon footprint is. They simply don't see it as a risk. We are showing them that it is a hidden operational liability they need to manage now before they scale.

---

### PART 5: The "Emotional Intelligence" vs. "Environmental Impact" Clash
**Speakers**: **Neha** (Visitor) and **Presenter** (Team GTR)

> **Neha**: Hi! Oh, you finally got the new name, right? Climatico! You guys have changed a lot since the last review.
> 
> **Presenter**: Yes! The core thesis of intervening early for startups is the same, but we shifted from human-led advisory to a digital +/- net impact dashboard. We model how their operating choices impact the planet.
> 
> **Neha**: What does "EI" stand for here? Environmental Impact?
> 
> **Presenter**: Yes, Environmental Impact.
> 
> **Neha**: You should specify that clearly somewhere, because in most business and psychology contexts, **EI stands for Emotional Intelligence**.
> 
> **Presenter**: That is an excellent point. We will make sure to define it as "Environmental Impact Index" on first use to avoid any confusion.
> 
> **Neha**: Yes, please do. Looking at this poster, it reminds me of academic research poster layouts at universities. 
> 
> **Presenter**: Yes, we kept the evidence grounded in frameworks, but we want to make the design much more approachable and visual.
> 
> **Neha**: What parts of the environment are you actually measuring? Is it just air emissions, or other elements?
> 
> **Presenter**: Right now, our quantitative engine focuses on carbon emissions (tCO₂e) because that is the most standardized, but our model also flags water usage, energy consumption, and solid waste. We want to make this highly tailored to each specific startup sector.

---

### PART 6: Interactive Onboarding and Personas
**Speakers**: **Denise** (Visitor/Founder), **Gabriel** (Team GTR), and **Presenter** (Team GTR)

> **Gabriel**: You can try the live prototype on this screen! We have it set up here.
> 
> **Denise**: Oh, great. The screen went to sleep, let me unlock it... How do I start the onboarding?
> 
> **Gabriel**: This is step one of the onboarding wizard. You enter your basic startup profile—funding stage, business model, and headcount.
> 
> **Denise**: Okay, let's type in "Marketplace" and progress.
> 
> **Gabriel**: Once you complete this basic intake, the system instantly computes a modeled footprint and avoids-emissions snapshot. It gives you a directional report on costs, hotspots, and first actions.
> 
> **Denise**: Oh, and then I can click through to a dashboard?
> 
> **Gabriel**: Exactly. The dashboard lets you track milestones, set climate goals, and update your data as you replace model defaults with actual data.
> 
> **Denise**: What is this other tab here? "Investor"?
> 
> **Presenter**: That is the Investor Dashboard. If you are a venture capitalist or portfolio manager, you can track the aggregated climate exposure, carbon intensity, and reduction progress of all your portfolio companies in one view.
> 
> **Denise**: Ah, got it. It displays their total carbon risk.
> 
> **Presenter**: Yes, and we also have a "Program Dashboard" built for accelerators and incubators. It displays a cohort leaderboard so startups can compete on transition speed and carbon efficiency.

---

### PART 7: Tracing the Source of Truth
**Speakers**: **Denise** (Visitor/Founder), **Gabriel** (Team GTR), and **Presenter** (Team GTR)

> **Denise**: So, how is the data actually integrated? You mentioned Workday and Salesforce.
> 
> **Presenter**: Yes, once a startup is onboarded, they can link operational platforms. For instance, Workday provides employee headcount, office locations, and commute data.
> 
> **Denise**: So Workday tells you the employee travel cost or remote status, and you correlate that directly to carbon?
> 
> **Presenter**: Yes, we can parse business travel expenses and remote-work ratios to estimate office and travel footprints very precisely.
> 
> **Denise**: I think it would be helpful to understand this more clearly. It’s a great idea, but to make it believable, I need to see exactly *what* is being calculated. Like, is it travel cost? Manufacturing? Server run-time? If I can see the exact breakdown of what goes into the equation, I will trust the numbers.
> 
> **Presenter**: That is very fair. We should expose the calculation inputs and our evidence sources more prominently in the UI.
> 
> **Denise**: Yes, because right now, there are a million things in the world you could measure. I’m left wondering: Are *you* doing the measuring? Is Workday doing it? Or is some other API responsible? Also, as an individual employee, am I personally responsible for my company's carbon? How do you differentiate between my personal home emissions and my office-work emissions?
> 
> **Presenter**: We use standard corporate boundary rules (GHG Protocol) where employee commutes and remote work-from-home energy are counted under Scope 3 corporate emissions, but your personal life is outside the boundary. We will make these boundaries and methodology visible.

---

### PART 8: The CEO's ROI Test
**Speakers**: **Vic** (Investor/CEO Persona) and **Presenter** (Team GTR)

> **Vic**: I definitely understand the "why" from a climate perspective. But why should I care as a business owner? How does this affect my cost or my revenue?
> 
> **Presenter**: It reduces operational risks and helps you secure capital from ESG-aligned VCs.
> 
> **Vic**: Sure, but as a CEO, what does this actually do for my day-to-day bottom line? Does it make it cheaper for me to operate as a company? If you can show me that reducing my carbon footprint directly lowers my cloud server bills or travel expenses, then absolutely—I'll sign up on Monday. If not, it just feels like an extra chore. How are you reaching founders to get them to sign up? You need a clear hook tied to business survival.
> 
> **Presenter**: That is incredible feedback. We need to align our "actionable insights" to show cost-reduction alongside carbon-reduction.

---

### PART 9: "Tell Me HOW" (The Monday Morning Test)
**Speakers**: **Denise** (Visitor/Founder) and **Presenter** (Team GTR)

> **Denise**: I'm reading this section on "Scenario and Decision Support." It says: *"Action: Make lower-impact decisions during product development and operations."* My question is: **How? How do I actually do this?**
> 
> **Presenter**: For example, in the onboarding wizard, we link to resources—
> 
> **Denise**: No, look at what you are displaying. You tell me all the good things I'm doing and all the bad things I'm doing. But it all comes down to **how**. Tell me *how* to do it, step-by-step. Don't just give me a high-level action. Give me the exact, concrete steps I need to take when I go back to work on Monday and talk to my team. I want that level of detail.
> 
> **Presenter**: Right now, our example is: if you are sourcing hardware parts from a Chinese factory, switching to an American factory might be slightly more expensive but will cut your manufacturing emissions in half.
> 
> **Denise**: Sure, but that still doesn't tell me *how* to do it. Sourcing is incredibly complex. You don't have to do it all yourself—Climatico can't solve global supply chains. But you can be a trusted **repository of information**. Give me external links, resources, YouTube videos, articles, or podcasts. Give me the knowledge. Tell me *how* to do it, not just *why* I should.
> 
> **Presenter**: Ah! So you want to be able to delegate tasks based on the report.
> 
> **Denise**: Yes! I want to open this report on Monday morning and say: *"Gabriel, look into this specific hardware supplier link. Tej, execute this server-optimization guide."* And then, when my team takes action, I want to come back to the dashboard a week later, input our new data, and see our progress shift from bad to neutral, and eventually to green. And the tool should remind me: *"Hey, did you switch your servers? Input your new cloud metrics to see your progress."* That is what I want as a startup founder. Not just a grade, but a tool for action.

---

### PART 10: The UI and Iconography Pass
**Speakers**: **Katya** (Visual Designer) and **Presenter** (Team GTR)

> **Katya**: I think the onboarding is very intuitive and exciting. 
> 
> **Presenter**: Thank you!
> 
> **Katya**: My only design feedback is that I wish you could add some semantic icons next to the metrics and actions so it’s not just big blocks of text. Icons would reduce cognitive load. But the layout itself makes a lot of sense, and you have successfully prioritized the most important information near the top. It doesn't feel cluttered. The design feels very intentional and intuitive. Well done!
> 
> **Presenter**: Oh my god, thank you so much! You sound like a professional UX designer, that means a lot to us!

---

### PART 11: Translating Academics into Digital Publications
**Speakers**: **Marc** (Publication Designer) and **Presenter** (Team GTR)

> **Marc**: The strategic newsletter poster is a great touch, but it reads like an academic research paper at first glance. How can you make this more approachable, visually engaging, and interactive? I highly recommend taking inspiration from digital publications like *The New York Times*. They do editorial layout, data visualizations, and interactive storytelling incredibly well. People just don't read paragraphs and paragraphs of dense text anymore.
> 
> **Presenter**: That is excellent advice. We can incorporate richer imagery, larger callouts, and clean data graphics to make the editorial copy breathe.
> 
> **Marc**: Yes, add imagery! The environment is highly visual—leverage that. It shouldn't just be a wall of text.
> 
> **Presenter**: Absolutely. Thank you so much for the feedback! This gives us a clear roadmap for our next design sprint.
