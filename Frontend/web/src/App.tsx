import { Navbar } from "./components/ui/Navbar/Navbar";
import "./App.css";
import { Login } from "./pages/Login/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <>
      <AuthProvider>
        <Navbar />
        <Login />
      </AuthProvider>
    </>
  );
}

export default App;
