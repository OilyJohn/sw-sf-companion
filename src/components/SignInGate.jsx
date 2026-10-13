import { useAuth } from '../auth.jsx';
import { signIn } from '../firebase.js';

export default function SignInGate({ children, what = 'your squads' }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="muted">Loading…</p>;
  if (!user) {
    return (
      <div className="card center">
        <p>Sign in to see {what}. Your squads are saved to your account and work offline at the table.</p>
        <button className="btn" onClick={() => signIn().catch(e => alert(e.message))}>Sign in with Google</button>
      </div>
    );
  }
  return children;
}
