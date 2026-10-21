import { Navigate } from 'react-router-dom';
// One authenticated billing surface owns server catalog, linkage and checkout.
export default function ChoosePlanPage() { return <Navigate to="/subscription" replace/>; }
