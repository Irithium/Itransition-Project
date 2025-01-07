import { useEffect } from "react";
import useUserStore from "@/stores/UserStore";
import api from "@/services/api";

const useAuth = () => {
  const { user, token, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/users/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser(response.data, token);
        })
        .catch(() => {
          clearUser();
        });
    }
  }, [setUser, clearUser]);

  const login = async (values) => {
    const response = await api.post("/auth/login", values);
    setUser(response.data.user, response.data.token);
    localStorage.setItem("token", response.data.token);
    return response.data.message;
  };

  const register = async (values) => {
    const response = await api.post("/auth/register", values);
    setUser(response.data.user, response.data.token);
    localStorage.setItem("token", response.data.token);
    return response.data.message;
  };

  const logout = () => {
    clearUser();
    localStorage.removeItem("token");
  };

  return {
    user,
    token,
    login,
    register,
    logout,
  };
};

export default useAuth;
