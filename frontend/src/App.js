import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {SignIn} from "./component/SignIn";
import {Home} from "./component/Home";
import {Navigation} from './component/Navigation';
import {Logout} from './component/Logout';
import {SignUp} from './component/SignUp';
import { SubAccounts } from './component/SubAccounts';

function App() {
    return (
      <BrowserRouter>
        <Navigation></Navigation>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/sign-in" element={<SignIn/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/accounts" element={<SubAccounts/>}/>
          <Route path="/sign-up" element={<SignUp/>}/>
        </Routes>
      </BrowserRouter>);
}
export default App;