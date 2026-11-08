import { LeadManagementDashboard } from "@/components/leads/LeadManagementDashboard";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

const Leads = () => {
  const { isRTL } = useLang();

  return (
    <div
      className={cn("w-full", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="leads-page"
    >
      {/* Enhanced Lead Management with Integrated Queue Management */}
      <LeadManagementDashboard />
    </div>
  );
};

export default Leads;
