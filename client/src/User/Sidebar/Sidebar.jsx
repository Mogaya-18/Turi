import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({
    fullName: "Patient User",
    role: "Patient",
    initials: "PT",
  });

  useEffect(() => {
    const loadSidebarUserProfile = async () => {
      // 1. Get current logged-in user session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 2. Query profiles table by logged in user email or ID
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        let name = data?.full_name;

        // Fallback by email match if ID record hasn't synced
        if (!name && user.email) {
          const { data: emailData } = await supabase
            .from("profiles")
            .select("full_name, role")
            .ilike("email", user.email)
            .maybeSingle();
          name = emailData?.full_name;
        }

        if (name) {
          // Compute initials dynamically
          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          setUserProfile({
            fullName: name,
            role: data?.role
              ? data.role.charAt(0).toUpperCase() + data.role.slice(1)
              : "Patient",
            initials: initials || "PT",
          });
        }
      }
    };

    loadSidebarUserProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const menuItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Book Appointment", path: "/book-appointment" },
    { name: "Appointments", path: "/appointments" },
    { name: "Consultation", path: "/consultation" },
    { name: "Messages", path: "/messages", badge: 3 },
    { name: "Health records", path: "/records" },
    { name: "Invoices & Billing", path: "/invoices" },
    { name: "Profile & Settings", path: "/profile" },
  ];

  return (
    <aside className="sidebar">
      {/* Brand & Workspace Header */}
      <div className="sidebar-header">
        <div
          className="brand-logo"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-icon">+</div>
          <h2>Turi.</h2>
        </div>

        <div className="workspace-dropdown">
          <div className="workspace-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="workspace-text">
            <span className="workspace-label">WORKSPACE</span>
            <span className="workspace-name">Patient portal</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <span className="menu-heading">MENU</span>
        <nav className="menu-nav">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/invoices" &&
                location.pathname.startsWith("/invoices"));
            return (
              <div
                key={item.name}
                className={`menu-item ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <div className="menu-item-content">
                  <span className="menu-text">{item.name}</span>
                  {item.badge && (
                    <span className="menu-badge">{item.badge}</span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Dynamic Footer Profile */}
      <div className="sidebar-footer">
        <div
          className="user-profile"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="user-avatar">{userProfile.initials}</div>
          <div className="user-info">
            <span className="user-name">{userProfile.fullName}</span>
            <span className="user-role">{userProfile.role}</span>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
