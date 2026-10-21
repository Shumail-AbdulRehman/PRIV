import { Navigate } from 'react-router-dom';
// A checkout return inspects provider facts; its URL never proves payment.
export default function WelcomePage() { return <Navigate to="/subscription?activation=pending" replace/>; }
