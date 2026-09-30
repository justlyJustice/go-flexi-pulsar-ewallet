interface DataPlan {
  planTypes: { value: string; label: string }[];
}

export interface MtnDataPlan extends DataPlan {
  dataPlans: {
    variation_code: string;
    name: string;
    variation_amount: string;
    fixedPrice: string;
    planType: "daily" | "weekly" | "monthly" | "xtra-data";
  }[];
}

export interface AirtelDataPlan extends DataPlan {
  dataPlans: {
    variation_code: string;
    name: string;
    variation_amount: string;
    fixedPrice: string;
    planType: "daily" | "weekly" | "monthly" | "mifi-plan" | "yearly";
  }[];
}

export interface GloDataPlan extends DataPlan {
  dataPlans: {
    variation_code: string;
    name: string;
    variation_amount: string;
    fixedPrice: string;
    planType:
      | "daily"
      | "weekly"
      | "monthly"
      | "weekend"
      | "special"
      | "sunday"
      | "mega"
      | "tv"
      | "social"
      | "campus-booster"
      | "sme";
  }[];
}
export interface NineMobileDataPlan extends DataPlan {
  dataPlans: {
    variation_code: string;
    name: string;
    variation_amount: string;
    fixedPrice: string;
    planType: "daily" | "monthly" | "social";
  }[];
}
