import { create } from "zustand";
import { persist } from "zustand/middleware";

import { banks } from "../banksList";

type Bank = {
  id: number;
  name: string;
  code: string;
};

interface BanksState {
  banks: Bank[];
}

const allBanks = banks.map((bank) => ({
  name: bank.name,
  code: bank.code,
  id: bank.id,
}));

export const useBankStore = create<BanksState>()(
  persist(
    (_set, _get) => ({
      banks: allBanks,
    }),
    { name: "banks-storage" }
  )
);
