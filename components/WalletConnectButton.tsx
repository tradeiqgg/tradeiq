"use client";

import { useWalletModalSafe } from "@/lib/useWalletSafe";
import { NeonButton } from "@/components/ui/NeonButton";

export function WalletConnectButton() {
  const { setVisible } = useWalletModalSafe();

  return (
    <NeonButton
      onClick={() => setVisible(true)}
      size="lg"
      variant="primary"
    >
      Connect Wallet
    </NeonButton>
  );
}

