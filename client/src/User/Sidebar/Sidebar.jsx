import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./Sidebar.css";

const PROFILE_CACHE_KEY = "turi_patient_sidebar_profile";

function getInitials(name) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "PT"
  );
}

function buildProfileObject(profileRow, authUser) {
  const rawName =
    profileRow?.full_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    (authUser?.email
      ? authUser.email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : null);

  if (!rawName) return null;

  const rawRole =
    profileRow?.role || authUser?.user_metadata?.role || "Patient";
  const formattedRole =
    rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  return {
    userId: authUser?.id || null,
    fullName: rawName.trim(),
    role: formattedRole,
    initials: getInitials(rawName.trim()),
  };
}

function readCachedProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.fullName) return parsed;
    }
  } catch {
    // Ignore storage errors
  }
  return {
    userId: null,
    fullName: "Patient User",
    role: "Patient",
    initials: "PT",
  };
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize synchronously from sessionStorage so route transitions never reset to "Patient User"
  const [userProfile, setUserProfile] = useState(readCachedProfile);
  const [messageCount, setMessageCount] = useState(0);

  const fetchAppointmentCount = useCallback(async (userId) => {
    if (!userId) return;
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", userId);

    if (!error && typeof count === "number") {
      setMessageCount(count);
    }
  }, []);

  const syncProfile = useCallback(
    async (authUser) => {
      if (!authUser) return;

      await fetchAppointmentCount(authUser.id);

      let { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .maybeSingle();

      if (!profileData && authUser.email) {
        const { data: emailMatch } = await supabase
          .from("profiles")
          .select("full_name, role")
          .ilike("email", authUser.email)
          .maybeSingle();
        profileData = emailMatch;
      }

      const resolved = buildProfileObject(profileData, authUser);
      if (resolved) {
        setUserProfile(resolved);
        try {
          sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(resolved));
        } catch {
          // Ignore storage errors
        }
      }
    },
    [fetchAppointmentCount],
  );

  useEffect(() => {
    let isMounted = true;
    let channel;
    let activeUserId = null;

    const initSidebar = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;
      if (currentUser && isMounted) {
        activeUserId = currentUser.id;
        await syncProfile(currentUser);

        channel = supabase
          .channel(`sidebar-appointments-${currentUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "appointments",
              filter: `patient_id=eq.${currentUser.id}`,
            },
            () => {
              if (isMounted) fetchAppointmentCount(currentUser.id);
            },
          )
          .subscribe();
      }
    };

    initSidebar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT") {
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      } else if (session?.user) {
        activeUserId = session.user.id;
        syncProfile(session.user);
      }
    });

    const handleLocalUpdate = () => {
      if (activeUserId && isMounted) {
        fetchAppointmentCount(activeUserId);
      }
    };

    window.addEventListener("appointmentsUpdated", handleLocalUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("appointmentsUpdated", handleLocalUpdate);
      subscription?.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchAppointmentCount, syncProfile]);

  const handleSignOut = async () => {
    try {
      sessionStorage.removeItem(PROFILE_CACHE_KEY);
    } catch {
      // Ignore storage errors
    }
    await supabase.auth.signOut();
    navigate("/login");
  };

  const menuItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Book Appointment", path: "/book-appointment" },
    { name: "Appointments", path: "/appointments" },
    { name: "Consultation", path: "/consultation" },
    {
      name: "Messages",
      path: "/messages",
      badge: messageCount > 0 ? messageCount : null,
    },
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
                  {item.badge !== null && item.badge !== undefined && (
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
