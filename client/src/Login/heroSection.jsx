import React, { useState } from "react";

import Slide1 from "../assets/Slide1.jpg";
import Slide2 from "../assets/Slide2.jpg";
import Slide3 from "../assets/Slide3.jpg";

export default function HeroSection() {
  const slides = [
    {
      id: 1,
      title: "Welcome to Turi, Your Trusted Online Clinic Solution",
      description:
        "Connecting patients and healthcare providers seamlessly for modern medical care.",
      image: Slide1,
    },
    {
      id: 2,
      title: "Virtual Consultations with Top Doctors",
      description:
        "Book appointments and consult with certified specialists from the comfort of your home.",
      image: Slide2,
    },
    {
      id: 3,
      title: "Secure Medical Records & Prescriptions",
      description:
        "Access your health history, lab results, and active prescriptions anytime, anywhere.",
      image: Slide3,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="hero-banner-wrapper">
      <section className="hero-container">
        <div className="hero-card">
          <button
            className="nav-arrow left"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            &lt;
          </button>

          <div className="hero-content">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="hero-image"
            />
            <div className="hero-text">
              <h1>{currentSlide.title}</h1>
              <p>{currentSlide.description}</p>
            </div>
          </div>

          <button
            className="nav-arrow right"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            &gt;
          </button>
        </div>

        <div className="cta-buttons">
          <button className="btn btn-teal">Create Account</button>
          <button className="btn btn-blue">Login</button>
        </div>
      </section>
    </div>
  );
}
