export type AuthActionState = {
  errors?: {
    managerName?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
  success?: boolean;
};
