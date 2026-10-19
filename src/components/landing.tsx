"use client";

import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  m,
  useReducedMotion,
} from "motion/react";
import {
  fadeTransition,
  navigationSpring,
  revealVariants,
  surfaceSpring,
} from "@/lib/motion";
import { Brand } from "./brand";
import { Icon } from "./icon";
import { FieldLandscape } from "./field-landscape";
import { CandyButton, MotionLink } from "./motion";
import { Badge } from "./ui";
import { ThemeToggle } from "./theme";

const features = [
  {
    icon: "cpu",
    number: "01",
    title: "Six signals. One complete story.",
    text: "Read beyond ambient air. Pulp, supply and return temperature, compressor current, ignition, and door state bring the journey into focus.",
    link: "Explore the telemetry",
    href: "/dashboard#monitoring",
  },
  {
    icon: "shield",
    number: "02",
    title: "Understand before you attribute.",
    text: "Distinguish hot loading, cooling shutoff, blocked airflow, and mechanical faults through six transparent diagnostic scenarios.",
    link: "Inspect the diagnostics",
    href: "/dashboard#diagnostics",
  },
  {
    icon: "wallet",
    number: "03",
    title: "A fair outcome starts with evidence.",
    text: "Review advisory shelf-life ranges, proposed rebates, and a shared custody record before a deduction becomes a dispute.",
    link: "See settlement recommendations",
    href: "/dashboard#settlements",
  },
];
const stages = [
  {
    title: "Establish the starting point",
    text: "Create the origin record and check crop-specific pre-cooling. A closed-door stabilization gate helps protect everyone from the first handover.",
    icon: "leaf",
    label: "ORIGIN PRE-COOL GATE",
    value: "12.4",
    unit: "°C",
    note: "Tomato target band: 10–13°C",
    checks: [
      "Core pulp temperature recorded",
      "15-minute stabilization required",
      "Driver protected against hot-loading blame",
    ],
    href: "/dashboard#shipments",
    link: "Explore an origin record",
  },
  {
    title: "Follow every custody handover",
    text: "Keep the cargo condition and the custody story together. Cross-probe trust checks flag questionable readings for independent review.",
    icon: "truck",
    label: "IN-TRANSIT TELEMETRY",
    value: "6",
    unit: "channels",
    note: "A shared view of cargo condition",
    checks: [
      "Tri-probe temperature profile",
      "Compressor and door-state context",
      "Low-trust evidence held for review",
    ],
    href: "/dashboard#monitoring",
    link: "Open the monitoring workspace",
  },
  {
    title: "Understand the thermal exposure",
    text: "Translate the temperature history into advisory shelf-life ranges. Separate baseline aging from excess exposure with explicit model assumptions.",
    icon: "activity",
    label: "SHELF-LIFE ADVISORY",
    value: "3.3–5.4",
    unit: "%",
    note: "Illustrative 6-hour tomato exposure at 20°C",
    checks: [
      "Crop-specific upper and lower bands",
      "Q₁₀ assumptions shown transparently",
      "Chilling injury flagged separately",
    ],
    href: "/dashboard#diagnostics",
    link: "Try the shelf-life calculator",
  },
  {
    title: "Bring evidence to the table",
    text: "Prepare a reproducible record, review the proposed allocation, and give each party a fair opportunity to inspect what happened.",
    icon: "file",
    label: "REVIEWABLE EVIDENCE PACKET",
    value: "SHA-256",
    unit: "",
    note: "Reproducible digest · unsigned certificate draft",
    checks: [
      "Export the underlying evidence record",
      "Prepare custodian and expert sections",
      "Human review before financial action",
    ],
    href: "/dashboard#evidence",
    link: "Explore the evidence library",
  },
];
const people = [
  {
    icon: "leaf",
    label: "FARMERS & FPOs",
    title: "The origin deserves a voice.",
    text: "Bring a pre-cooling record and a shared audit trail to the handover conversation.",
  },
  {
    icon: "truck",
    label: "DRIVERS & CARRIERS",
    title: "A clean journey deserves credit.",
    text: "Inspect your own evidence and get protection from blame for hot-loaded produce.",
  },
  {
    icon: "wallet",
    label: "BUYERS & RECEIVERS",
    title: "Receive more than a temperature.",
    text: "Understand thermal exposure and review quality adjustments with all parties.",
  },
  {
    icon: "file",
    label: "ARBITRATORS & INSURERS",
    title: "Start with a record you can inspect.",
    text: "Review transparent causes, custody history, and reproducible evidence exports.",
  },
];
const questions = [
  [
    "What can I explore in the demo?",
    "The workspace includes shipment and custody records, six-channel telemetry simulations, six diagnostic scenarios, a shelf-life calculator, settlement recommendations, and downloadable evidence drafts. Demo records stay in your browser.",
  ],
  [
    "Does the platform automatically deduct money?",
    "No. The current workspace prepares advisory recommendations for human review. No funds move, no policy is bound, and no insurance claim is submitted. Live operation requires regulated banking and insurance partners.",
  ],
  [
    "How does the record protect drivers?",
    "The origin pre-cooling record helps distinguish warm loading from a cooling fault during transit. Questionable readings go to human review. A temperature alert alone is not treated as proof of driver responsibility.",
  ],
  [
    "Are the estimates and certificates final verdicts?",
    "No. Shelf-life outputs are advisory ranges with uncalibrated demo assumptions. Certificate exports are unsigned preparation drafts. Physical validation, expert completion, and legal review are required before operational use.",
  ],
];

function Hero() {
  return (
    <section className="landing-hero landing-container">
      <m.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.075 } } }}
        className="hero-copy"
      >
        <m.div variants={revealVariants} className="landing-kicker">
          <span className="status-dot" />
          EVIDENCE-FIRST COLD CHAIN
        </m.div>
        <m.h1 variants={revealVariants}>
          Fresh cargo.
          <br />
          Clear evidence.
          <br />
          <span>Fair outcomes.</span>
        </m.h1>
        <m.p variants={revealVariants} className="hero-description">
          Know what happened between farm and market. Bring cargo condition,
          custody, and fair settlement into one shared record.
        </m.p>
        <m.div variants={revealVariants} className="hero-actions">
          <MotionLink
            href="/dashboard"
            className="button-primary landing-button"
          >
            Explore the workspace
            <Icon name="arrow" size={17} />
          </MotionLink>
          <MotionLink
            href="#workflow"
            className="button-secondary landing-button"
          >
            See how it works
            <Icon name="chevron" size={15} />
          </MotionLink>
        </m.div>
        <m.div variants={revealVariants} className="hero-assurances">
          <span>
            <Icon name="check" size={14} />
            Human-reviewed outcomes
          </span>
          <span>
            <Icon name="check" size={14} />
            Driver-protective by design
          </span>
        </m.div>
      </m.div>
      <m.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...surfaceSpring, delay: 0.12, opacity: fadeTransition }}
        className="hero-product"
      >
        <div className="preview-topline">
          <span>
            <span className="status-dot" />
            ONE JOURNEY. A SHARED RECORD.
          </span>
          <span>DEMO PREVIEW</span>
        </div>
        <div className="journey-preview">
          <div className="journey-scene">
            <div className="journey-scene-heading">
              <div>
                <span>SHIPMENT PB-0941</span>
                <h2>
                  From the farm.
                  <br />
                  With a record.
                </h2>
              </div>
              <span className="scene-truck">
                <Icon name="truck" size={24} />
              </span>
            </div>
            <div className="journey-landscape">
              <FieldLandscape />
            </div>
            <div className="journey-route">
              <strong>Sonipat FPO</strong>
              <span className="route-line">
                <i />
                <i />
                <i />
              </span>
              <strong>Azadpur Mandi</strong>
            </div>
          </div>
          <div className="journey-readings">
            {[
              ["Core pulp", "12.4"],
              ["Supply air", "9.8"],
              ["Return air", "12.1"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>
                  {value}
                  <small>°C</small>
                </strong>
              </div>
            ))}
          </div>
          <div className="journey-verdict">
            <span className="verdict-icon">
              <Icon name="shield" size={20} />
            </span>
            <div>
              <strong>Compliant transit</strong>
              <span>S1 · Within the tomato temperature band</span>
            </div>
            <Badge>In range</Badge>
          </div>
          <div className="journey-preview-footer">
            <span>
              <Icon name="lock" size={12} />
              Evidence before assumptions
            </span>
            <MotionLink href="/dashboard#shipments">
              Inspect the demo
              <Icon name="arrow" size={13} />
            </MotionLink>
          </div>
        </div>
        <m.div
          className="evidence-float"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...surfaceSpring, delay: 0.3 }}
        >
          <span className="evidence-float-icon">
            <Icon name="file" size={21} />
          </span>
          <span>
            <strong>A record everyone can review.</strong>
            <small>Custody trail · Thermal context · Evidence draft</small>
          </span>
          <span className="evidence-check">
            <Icon name="check" size={15} />
          </span>
        </m.div>
      </m.div>
    </section>
  );
}

function Product() {
  return (
    <m.section
      id="product"
      className="landing-section landing-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={revealVariants}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">BEYOND A TEMPERATURE ALERT</p>
          <h2>
            Less ambiguity.
            <br />
            More accountability.
          </h2>
        </div>
        <p>
          Monitoring tells you something changed.
          <br />A shared evidence trail helps you understand why.
        </p>
      </div>
      <div className="landing-feature-grid">
        {features.map((f) => (
          <article className="landing-feature" key={f.number}>
            <div className="flex items-center justify-between">
              <span className="feature-symbol">
                <Icon name={f.icon} size={23} />
              </span>
              <span className="feature-number">{f.number}</span>
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <MotionLink href={f.href}>
              {f.link}
              <Icon name="arrow" size={14} />
            </MotionLink>
          </article>
        ))}
      </div>
    </m.section>
  );
}

function Workflow() {
  const [active, setActive] = useState(0);
  const stage = stages[active];
  return (
    <m.section
      id="workflow"
      className="landing-section landing-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={revealVariants}
    >
      <div className="workflow-shell">
        <div className="workflow-copy">
          <p className="eyebrow">ORIGIN TO OUTCOME</p>
          <h2>
            Every handover.
            <br />A little more certainty.
          </h2>
          <p className="workflow-intro">
            An evidence trail that starts at loading and stays with the cargo.
          </p>
          <LayoutGroup id="landing-workflow">
            <div
              className="workflow-steps"
              role="tablist"
              aria-label="Cold-chain audit stages"
              aria-orientation="vertical"
            >
              {stages.map((s, i) => (
                <CandyButton
                  key={s.title}
                  role="tab"
                  aria-selected={active === i}
                  aria-controls="workflow-panel"
                  id={`workflow-tab-${i}`}
                  tabIndex={active === i ? 0 : -1}
                  onKeyDown={(e) => {
                    if (
                      !["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)
                    )
                      return;
                    e.preventDefault();
                    const next =
                      e.key === "Home"
                        ? 0
                        : e.key === "End"
                          ? stages.length - 1
                          : (i +
                              (e.key === "ArrowDown" ? 1 : -1) +
                              stages.length) %
                            stages.length;
                    setActive(next);
                    document.getElementById(`workflow-tab-${next}`)?.focus();
                  }}
                  className={`workflow-step ${active === i ? "workflow-step-active" : ""}`}
                  onClick={() => setActive(i)}
                  whileHover={{ y: 0 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {active === i && (
                    <m.span
                      layoutId="workflow-selection"
                      className="workflow-selection"
                      transition={navigationSpring}
                    />
                  )}
                  <span className="workflow-number">0{i + 1}</span>
                  <span>{s.title}</span>
                  <Icon name="chevron" size={15} />
                </CandyButton>
              ))}
            </div>
          </LayoutGroup>
        </div>
        <div
          className="workflow-preview"
          role="tabpanel"
          id="workflow-panel"
          aria-labelledby={`workflow-tab-${active}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ ...surfaceSpring, opacity: fadeTransition }}
            >
              <div className="workflow-preview-top">
                <Icon name={stage.icon} size={22} />
                <span>STEP 0{active + 1} / 04</span>
              </div>
              <p className="eyebrow mt-8!">{stage.label}</p>
              <div className="workflow-value">
                {stage.value}
                <span>{stage.unit}</span>
              </div>
              <p className="workflow-value-note">{stage.note}</p>
              <div className="workflow-checks">
                {stage.checks.map((c) => (
                  <span key={c}>
                    <Icon name="check" size={14} />
                    {c}
                  </span>
                ))}
              </div>
              <p className="workflow-stage-description">{stage.text}</p>
              <MotionLink className="workflow-preview-link" href={stage.href}>
                {stage.link}
                <Icon name="arrow" size={15} />
              </MotionLink>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </m.section>
  );
}

function People() {
  return (
    <m.section
      id="people"
      className="landing-section landing-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={revealVariants}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">A SHARED RECORD. A FAIRER CONVERSATION.</p>
          <h2>
            Built for every side
            <br />
            of the handover.
          </h2>
        </div>
        <p>
          Trust works better when everyone
          <br />
          can see the same story.
        </p>
      </div>
      <div className="people-grid">
        {people.map((p) => (
          <article key={p.label} className="people-card">
            <Icon name={p.icon} size={23} />
            <p className="eyebrow">{p.label}</p>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>
    </m.section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();
  return (
    <section className="landing-section landing-container landing-faq">
      <div>
        <p className="eyebrow">A FEW THINGS, MADE CLEAR</p>
        <h2>
          Good questions.
          <br />
          Straight answers.
        </h2>
        <p>
          Explore the product with a clear understanding of what the demo does
          today.
        </p>
      </div>
      <div>
        {questions.map(([question, answer], i) => (
          <div className="faq-item" key={question}>
            <CandyButton
              id={`faq-question-${i}`}
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-answer-${i}`}
              whileHover={{ y: 0 }}
              whileTap={{ scale: 1 }}
            >
              <span>{question}</span>
              <m.span animate={{ rotate: open === i ? -90 : 90 }}>
                <Icon name="chevron" size={16} />
              </m.span>
            </CandyButton>
            <AnimatePresence initial={false}>
              {open === i && (
                <m.div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { ...fadeTransition, duration: 0.22 }
                  }
                  className="overflow-hidden"
                >
                  <p>{answer}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-container landing-nav">
          <Brand />
          <nav aria-label="Product navigation">
            <MotionLink href="#product">The platform</MotionLink>
            <MotionLink href="#workflow">How it works</MotionLink>
            <MotionLink href="#people">Who it’s for</MotionLink>
          </nav>
          <div className="landing-nav-actions">
            <ThemeToggle />
            <MotionLink
              href="/dashboard"
              className="button-primary landing-nav-cta"
              aria-label="Open workspace"
            >
              <span>
                <span className="cta-open">Open </span>workspace
              </span>
              <Icon name="arrow" size={15} />
            </MotionLink>
          </div>
        </div>
      </header>
      <main id="main-content">
        <Hero />
        <div className="landing-container">
          <div className="landing-principles">
            {[
              ["thermometer", "Crop-specific monitoring"],
              ["shield", "Evidence-led diagnostics"],
              ["truck", "Driver-protective design"],
              ["file", "Reviewable records"],
            ].map(([icon, label]) => (
              <span key={label}>
                <Icon name={icon} size={18} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <Product />
        <Workflow />
        <People />
        <Faq />
        <m.section
          className="landing-container landing-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={revealVariants}
        >
          <div className="landing-closing">
            <div>
              <p className="eyebrow">
                BETTER EVIDENCE. LESS WASTE. FAIRER OUTCOMES.
              </p>
              <h2>
                Good produce deserves
                <br />a fair journey.
              </h2>
              <p>See what a shared evidence trail can make possible.</p>
            </div>
            <MotionLink
              href="/dashboard"
              className="button-secondary landing-button"
            >
              Explore the dashboard
              <Icon name="arrow" size={18} />
            </MotionLink>
          </div>
        </m.section>
      </main>
      <footer className="landing-footer landing-container">
        <div className="landing-footer-top">
          <Brand />
          <nav aria-label="Footer navigation">
            <MotionLink href="#product">The platform</MotionLink>
            <MotionLink href="#workflow">How it works</MotionLink>
            <MotionLink href="/dashboard">Dashboard</MotionLink>
          </nav>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 Perishables Black Box</span>
          <MotionLink href="#main-content">
            Back to top
            <Icon name="arrow" size={13} />
          </MotionLink>
        </div>
      </footer>
    </div>
  );
}
