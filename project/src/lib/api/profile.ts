import axios from 'axios';

export const updatePatientProfile = async (token: string, profileData: any) => {
  const response = await axios.put('http://localhost:8000/api/auth/me/', profileData, {
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: true,
  });

  return response.data;
};
