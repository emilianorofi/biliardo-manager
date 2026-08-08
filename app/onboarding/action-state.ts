export type ClubOnboardingActionState = {
  errors?: {
    clubName?: string[];
    city?: string[];
    primaryColor?: string[];
    secondaryColor?: string[];
    crestStyle?: string[];
  };
  message?: string;
};
