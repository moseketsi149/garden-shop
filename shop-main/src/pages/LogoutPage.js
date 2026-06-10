import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth } from '../firebase/config';
import { logoutUser } from '../features/auth/userSlice';

export default function LogoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function logout() {
      try {
        await signOut(auth);
        dispatch(logoutUser());
        toast.success('Successfully logged out! See you soon.');
        navigate('/login');
      } catch (error) {
        toast.error('Logout failed. Please try again.');
        console.error('Logout error:', error);
      }
    }

    logout();
  }, [dispatch, navigate]);

  return <div className="min-h-screen bg-slate-50 px-6 py-20 text-center text-slate-700">Signing out...</div>;
}
