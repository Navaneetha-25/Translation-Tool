import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Translate from "./Translate.js";
import Login from "./Login"; 
import Signup from "./Signup";
import "../index.css";
import "../App.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/translate" element={<Translate />} />
                <Route path="*" element={<Navigate to="/login" />} /> 
            </Routes>
        </Router>
    );
}

export default App;
