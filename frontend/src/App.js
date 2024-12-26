import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {SignIn} from "./component/SignIn";
import {Home} from "./component/Home";
import {Navigation} from './component/Navigation';
import {Logout} from './component/Logout';
import {SignUp} from './component/SignUp';
import { Account } from './component/Account';
import { AvailabilityDashboard } from './component/AvailabilityDashboard';
import { ManagerDashboard } from './component/ManagerDashboard';
import { ProtectedManagerRoute } from "./utils/authUtils";
import { ShiftAssignmentDashboard } from './component/ShiftAssignmentDashboard';

function App() {
    return (
      <BrowserRouter>
        <Navigation></Navigation>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/sign-in" element={<SignIn/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/sign-up" element={<SignUp/>}/>
          <Route path="/availability" element={<AvailabilityDashboard/>}/>
          <Route path="/assignment" element={<ShiftAssignmentDashboard/>}/>
          <Route path="/manager-dashboard" 
            element={
            <ProtectedManagerRoute roleRequired="MANAGER">
              <ManagerDashboard />
            </ProtectedManagerRoute>
          }/>
        </Routes>
      </BrowserRouter>);
}
export default App;