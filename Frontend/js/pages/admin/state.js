export const state = {
  activeTab: "reservations",
  reservations: [],
  restaurants: [],
  tables: [],

  reservationFilters: {
    user: "",
    restaurant: "",
    status: "",
    date: "",
  },

  tableFilters: {
    restaurant: "",
    user: "",
    date: "",
  },
};
