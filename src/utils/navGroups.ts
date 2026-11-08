/** Sidebar groups and the "G then letter" shortcuts. Paths match getNavItems. */
export const NAV_GROUPS = [
  { id: "workspace", label: "Workspace", paths: ["/dashboard", "/leads", "/messages", "/calendar"] },
  { id: "insight", label: "Insight", paths: ["/reports", "/projects", "/lead-pipeline"] },
  { id: "account", label: "Account", paths: ["/settings", "/faq", "/admin"] },
] as const;

export const NAV_SHORTCUTS: Record<string, string> = {
  "/dashboard": "d",
  "/leads": "l",
  "/messages": "m",
  "/calendar": "c",
  "/reports": "r",
  "/projects": "p",
  "/settings": "s",
};
