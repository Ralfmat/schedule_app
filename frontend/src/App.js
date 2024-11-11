import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {SignIn} from "./component/SignIn";
import {Home} from "./component/Home";
import {Navigation} from './component/Navigation';
import {Logout} from './component/Logout';
import {SignUp} from './component/SignUp';
import { Account } from './component/Account';
import { Employee } from './component/Employee';
import { Manager } from './component/Manager';
import { Calendar } from './component/Calendar';
import { Shift } from './component/Shift';

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
          <Route path="/employee" element={<Employee/>}/>
          <Route path="/manager" element={<Manager/>}/>
          <Route path="/calendar" element={<Calendar/>}/>
          <Route path="/shifts" element={<Shift/>}/>
        </Routes>
      </BrowserRouter>);
}
export default App;