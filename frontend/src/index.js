import React from "react";
import ReactDOM from "react-dom/client";
import MainApp from "./MainApp"; // ✅ Ensure this path is correct
import "./index.css"; // ✅ Ensure TailwindCSS is configured

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <MainApp />
    </React.StrictMode>
);
