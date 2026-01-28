export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
};

export const removeAccessToken = (): void => {
  localStorage.removeItem("accessToken");
};

export const getUser = (): any | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: any): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const logout = (): void => {
  removeAccessToken();
  removeUser();
};
