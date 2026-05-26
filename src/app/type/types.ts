export type UserType = {
  id: number;
  username: string;
  display_name: string;
  created_at: string;
};

export type ApiResultType = {
  success: boolean;
  data?: UserType[];
  msg?: string;
};
