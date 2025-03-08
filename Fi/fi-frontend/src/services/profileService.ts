import api from '../utils/api';

export const profileService = {
  // Create or update user profile
  updateProfile: (profileData: any) => 
    api.post('/profile/update-profile', profileData),
  
  // Get user profile
  getProfile: () => 
    api.get('/profile/get-profile'),
  
  // Delete user profile
  deleteProfile: () => 
    api.delete('/profile/delete-profile')
};