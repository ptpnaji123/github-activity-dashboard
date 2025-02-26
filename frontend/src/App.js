import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";

function App() {
    const [token, setToken] = useState(null);
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [branches, setBranches] = useState([]);
    const [showDashboard, setShowDashboard] = useState(false);

    // ✅ Get GitHub OAuth token from URL or localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromURL = urlParams.get("token");

        if (tokenFromURL) {
            setToken(tokenFromURL);
            localStorage.setItem("token", tokenFromURL);
        } else {
            setToken(localStorage.getItem("token"));
        }
    }, []);

    // ✅ Fetch repositories
    const fetchRepos = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`http://localhost:5000/repos?token=${token}`);
            setRepos(response.data);
        } catch (error) {
            console.error("❌ Error fetching repositories:", error);
        }
    };

    // ✅ Fetch branches when a repository is clicked
    const fetchBranches = async (repoFullName) => {
        if (!token) return;
        try {
            const response = await axios.get(`http://localhost:5000/branches/${repoFullName}?token=${token}`);
            setBranches(response.data);
            setSelectedRepo(repoFullName); // ✅ Update selected repo
        } catch (error) {
            console.error("❌ Error fetching branches:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {!token ? (
                <div className="flex justify-center items-center h-screen">
                    <a href="http://localhost:5000/auth/github">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                            Login with GitHub
                        </button>
                    </a>
                </div>
            ) : (
                <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">📂 Repositories</h2>
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
                        onClick={fetchRepos}
                    >
                        Fetch Repositories
                    </button>

                    {/* ✅ Repositories List */}
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {repos.map((repo) => (
                            <li
                                key={repo.id}
                                onClick={() => fetchBranches(repo.full_name)} // ✅ Make sure full_name is used
                                className="p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
                            >
                                {repo.name}
                            </li>
                        ))}
                    </ul>

                    {/* ✅ Display Selected Repository & Branches */}
                    {selectedRepo && (
                        <div className="mt-6">
                            <h3 className="text-xl font-bold">🌿 Branches for {selectedRepo}</h3>
                            <ul className="bg-gray-100 p-4 rounded-lg">
                                {branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <li key={branch.name} className="text-gray-700">
                                            {branch.name}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No branches found.</p>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* ✅ Show Dashboard Button */}
                    <div className="mt-6">
                        <button
                            className="bg-purple-500 text-white px-4 py-2 rounded"
                            onClick={() => setShowDashboard(true)}
                        >
                            Show Dashboard
                        </button>
                    </div>

                    {/* ✅ Dashboard Component */}
                    {showDashboard && <Dashboard token={token} selectedRepo={selectedRepo} />}
                </div>
            )}
        </div>
    );
}

export default App;
