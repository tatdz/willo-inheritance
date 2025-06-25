import { useQuery } from "@tanstack/react-query";
import { Coins, Users } from "lucide-react";

export function VaultAssetCount({ vaultId }: { vaultId: number }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['/api/assets', vaultId],
    queryFn: () => fetch(`/api/vaults/${vaultId}/assets`).then(r => r.json()),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <span className="text-sm text-gray-500">
      <Coins className="h-4 w-4 inline mr-1" />
      {assets.length} Assets
    </span>
  );
}

export function VaultBeneficiaryCount({ vaultId }: { vaultId: number }) {
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['/api/beneficiaries', vaultId],
    queryFn: () => fetch(`/api/vaults/${vaultId}/beneficiaries`).then(r => r.json()),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return (
    <span className="text-sm text-gray-500">
      <Users className="h-4 w-4 inline mr-1" />
      {beneficiaries.length} Beneficiaries
    </span>
  );
}