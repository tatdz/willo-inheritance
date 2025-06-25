import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshDashboard = () => {
    // Invalidate all relevant queries to force a refresh
    queryClient.invalidateQueries({ queryKey: ['/api/vaults'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
    queryClient.invalidateQueries({ queryKey: ['/api/beneficiaries'] });
  };

  // Listen for storage events (can be triggered by other tabs or components)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshDashboard();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  return { refreshDashboard };
}