import { useState } from "react";
import { Navbar } from "./components/ui/Navbar/Navbar";
import "./App.css";
import { Login } from "./pages/Login/Login";

function App() {
  return (
    <>
      <Navbar />
      <Login />
    </>
  );
}

export default App;
