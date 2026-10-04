import api from "./api";

export const getDispatches = async (params = {}) => {
  const response = await api.get("/dispatches", {
    params,
  });

  return response.data;
};

export const getDispatchById = async (id) => {
  const response = await api.get(`/dispatches/${id}`);

  return response.data;
};

export const createDispatch = async (data) => {
  const response = await api.post("/dispatches", data);

  return response.data;
};

export const startDispatch = async (id) => {
  const response = await api.post(`/dispatches/${id}/start`);

  return response.data;
};

export const updateDeliveryProgress = async (id, status) => {
  const response = await api.post(
    `/dispatches/${id}/delivery-status`,
    { status }
  );

  return response.data;
};

export const completeDispatch = async (id) => {
  const response = await api.post(
    `/dispatches/${id}/complete`
  );

  return response.data;
};

export const cancelDispatch = async (id) => {
  const response = await api.post(
    `/dispatches/${id}/cancel`
  );

  return response.data;
};