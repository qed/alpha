const SCHEDULE = [
  {
    time: "8:45 - 9:00 AM",
    title: "Limitless Launch",
    description:
      "Intention-setting, gratitude, and mindset work to start the day with purpose.",
  },
  {
    time: "9:00 AM - 12:00 PM",
    title: "Guided Academic Time",
    description:
      "Students work with AI tutoring software to master math, reading, and science while Guides provide 1:1 support.",
  },
  {
    time: "12:00 - 1:00 PM",
    title: "Lunch & Wellness",
    description:
      "A real break with structured mindfulness, physical activity, and time to recharge.",
  },
  {
    time: "1:00 - 3:30 PM",
    title: "Life Skills & Enrichment",
    description:
      "Communication, financial literacy, public speaking, coding, cooking, and more.",
  },
];

export function DailyScheduleSection() {
  return (
    <section className="wp-schedule">
      <div className="wp-schedule-inner">
        <h2 className="wp-schedule-heading">A Day at Alpha</h2>
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
