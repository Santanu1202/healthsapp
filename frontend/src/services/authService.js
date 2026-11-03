
import api from "./api";

export const loginuser = async (patient_id, password) => {
    const response = await api.post(
        "accounts/login/",
        {
            patient_id,
            password
        }
    );

    return response.data;
};
