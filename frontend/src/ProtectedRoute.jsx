export default function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <div className="center-text">Please login to continue.</div>;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <div className="center-text">Access denied (admin only).</div>;
  }
  return children;
}
