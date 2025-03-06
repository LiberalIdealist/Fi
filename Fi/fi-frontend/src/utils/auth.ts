export const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };
  
  export const setAuthToken = (token: string) => {
    localStorage.setItem("auth_token", token);
  };
  
  export const removeAuthToken = () => {
    localStorage.removeItem("auth_token");
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken();
  };