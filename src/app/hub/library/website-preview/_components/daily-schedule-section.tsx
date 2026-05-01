const SCHEDULE = [
  {
    time: "8:45 – 9:00 AM",
    title: "Limitless Launch",
    description:
      "Every day begins with 15 minutes of intention-setting, gratitude, and mindset work — priming students to show up as their best selves before learning begins.",
  },
  {
    time: "9:00 AM – 12:00 PM",
    title: "Guided Academic Time",
    description:
      "Students work with AI tutoring software to master math, reading, and science. Guides (not teachers) support when students get stuck — the AI does the heavy lifting.",
  },
  {
    time: "12:00 – 1:00 PM",
    title: "Lunch & Wellness",
    description:
      "A real break. Students eat, move, rest, and recharge — with structured mindfulness and physical activity built in daily.",
  },
  {
    time: "1:00 – 3:30 PM",
    title: "Life Skills & Enrichment",
    description:
      "Communication, financial literacy, public speaking, coding, cooking — the skills school usually skips but life absolutely requires.",
  },
];

export function DailyScheduleSection() {
  return (
    <section className="wp-schedule">
      <div className="wp-schedule-inner">
        <div className="wp-schedule-eyebrow">The Daily Experience</div>
        <h2 className="wp-schedule-heading">
          What does a day at Alpha actually look like?
        </h2>
        <p className="wp-schedule-subtitle">
          Every day is structured to maximize learning, growth, and joy
          &mdash; in that order.
        </p>
        <div className="wp-schedule-steps">
          {SCHEDULE.map((step) => (
            <div key={step.title} className="wp-schedule-step">
              <div className="wp-schedule-time">{step.time}</div>
              <div>
                <div className="wp-schedule-step-title">{step.title}</div>
                <div className="wp-schedule-step-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
