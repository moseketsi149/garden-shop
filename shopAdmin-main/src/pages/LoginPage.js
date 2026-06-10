import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [loading, user, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        try {
          await setDoc(doc(db, 'users', credential.user.uid), {
            email,
            name,
            role: 'admin',
            tenant: 'default',
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.warn('Firestore write failed while creating user account.', error);
        }
        setSuccess('Admin account created successfully. Signing in...');
        navigate(from, { replace: true });
        return;
      }

       await signInWithEmailAndPassword(auth, email, password);
       alert('Successfully logged in!');
       navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-card">
        <h2 className="text-3xl font-semibold text-slate-900">{isRegister ? 'Register admin' : 'Admin login'}</h2>
        {error && <p className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-rose-700">{error}</p>}
        {success && <p className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-emerald-700">{success}</p>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isRegister && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>
          <button className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800">
            {isRegister ? 'Create admin account' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          {isRegister ? (
            <button className="font-semibold text-slate-900 hover:text-slate-700" onClick={() => setIsRegister(false)}>
              Already an admin? Sign in
            </button>
          ) : (
            <button className="font-semibold text-slate-900 hover:text-slate-700" onClick={() => setIsRegister(true)}>
              Register a new admin account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
