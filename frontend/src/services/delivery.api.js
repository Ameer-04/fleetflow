import api from "./api";

export const getDeliveries = async (params = {}) => {
  const response = await api.get("/deliveries", {
    params,
  });

  return response.data;
};

export const getDeliveryById = async (id) => {
  const response = await api.get(`/deliveries/${id}`);

  return response.data;
};

export const createDelivery = async (data) => {
  const response = await api.post("/deliveries", data);

  return response.data;
};

export const updateDelivery = async (id, data) => {
  const response = await api.patch(
    `/deliveries/${id}`,
    data
  );

  return response.data;
};

export const changeDeliveryStatus = async (
  id,
  status
) => {
  const response = await api.post(
    `/deliveries/${id}/status`,
    { status }
  );

  return response.data;
};

export const cancelDelivery = async (
  id,
  reason
) => {
  const response = await api.post(
    `/deliveries/${id}/cancel`,
    { reason }
  );

  return response.data;
};

export const deleteDelivery = async (id) => {
  const response = await api.delete(
    `/deliveries/${id}`
  );

  return response.data;
};