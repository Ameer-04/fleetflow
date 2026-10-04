import api from "./api";

export const getDrivers = async (params = {}) => {
  const response = await api.get("/drivers", { params });
  return response.data;
};

export const getDriverById = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (data) => {
  const response = await api.post("/drivers", data);
  return response.data;
};

export const updateDriver = async (id, data) => {
  const response = await api.patch(`/drivers/${id}`, data);
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`/drivers/${id}`);
  return response.data;
};

export const assignVehicle = async (driverId, vehicleId) => {
  const response = await api.post(
    `/drivers/${driverId}/assign-vehicle`,
    { vehicleId }
  );

  return response.data;
};

export const unassignVehicle = async (driverId) => {
  const response = await api.post(
    `/drivers/${driverId}/unassign-vehicle`
  );

  return response.data;
};