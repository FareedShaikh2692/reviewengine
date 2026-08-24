import {
  LayoutDashboard,
  Users,
  Send,
  Megaphone,
  Workflow,
  Star,
  Sparkles,
  MapPin,
  UsersRound,
  Settings,
} from "lucide-react";

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/review-requests", label: "Review Requests", icon: Send },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/dashboard/automations", label: "Automations", icon: Workflow },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/insights", label: "AI Insights", icon: Sparkles },
  { href: "/dashboard/locations", label: "Locations", icon: MapPin },
  { href: "/dashboard/team", label: "Team", icon: UsersRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
