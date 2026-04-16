// TOKEN HELPERS
export const token = {
  get:    ()  => localStorage.getItem("gc_token"),
  set:    (t) => localStorage.setItem("gc_token", t),
  remove: ()  => localStorage.removeItem("gc_token"),
  exists: ()  => !!localStorage.getItem("gc_token"),
};

export const user = {
  get:    ()  => JSON.parse(localStorage.getItem("gc_user") || "null"),
  set:    (u) => localStorage.setItem("gc_user", JSON.stringify(u)),
  remove: ()  => localStorage.removeItem("gc_user"),
  isAdmin:()  => user.get()?.rol === "ADMIN",
};