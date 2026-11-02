export default function howItWorks() {
  const steps = [
    {
      num: "1. Register",
      desc: "Create your personal health profile and security credentials",
      icon: "👤",
    },
    {
      num: "2. Book",
      desc: "Select a doctor, time slot and preferred consultation type",
      icon: "📅",
    },
    {
      num: "3. Attend",
      desc: "Join your virtual appointment or visit the clinic in person",
      icon: "💬",
    },
  ];

  return (
    <section className="how-it-works">
      <h2>How it works</h2>
      <div className="three-column-grid">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <div className="step-text">
              <h4>{step.num}</h4>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
