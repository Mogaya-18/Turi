export default function featureCards() {
  const features = [
    {
      icon: "📅",
      title: "Book online",
      desc: "Schedule your appointments with your preferred doctor",
    },
    {
      icon: "📋",
      title: "Records and Prescriptions",
      desc: "Access and manage all your medical history and prescription details securely",
    },
    {
      icon: "💳",
      title: "Billing",
      desc: "Easily view statements, pay bills online and track payment history",
    },
  ];

  return (
    <section className="three-column-grid">
      {features.map((item, index) => (
        <div key={index} className="feature-card">
          <div className="icon-wrapper">{item.icon}</div>
          <div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
