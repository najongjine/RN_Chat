export type UserType = {
  id: number;
  username: string;
  display_name: string;
  created_at: string;
};

export type AuthUserType = Pick<
  UserType,
  "id" | "username" | "display_name"
>;

export type AuthSessionType = {
  access_token: string;
  user: AuthUserType;
};

export type ApiResultType<T = UserType[]> = {
  success: boolean;
  data?: T;
  msg?: string;
};
