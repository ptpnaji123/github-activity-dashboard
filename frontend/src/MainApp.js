import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";

function MainApp() {
    const [token, setToken] = useState(null);
    const [repos, setRepos] = useState([]);
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [repoData, setRepoData] = useState({});

    // ✅ Get GitHub OAuth token
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
        if (!token) {
            console.error("🚨 No GitHub token found! Login first.");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/repos?token=${token}`);
            setRepos(response.data);
        } catch (error) {
            console.error("❌ Error fetching repositories:", error.response?.data || error.message);
        }
    };

    // ✅ Handle selecting/deselecting repositories & fetch branches + PRs
    const handleToggleRepo = async (repo) => {
        let updatedSelection = [...selectedRepos];

        if (selectedRepos.includes(repo.name)) {
            updatedSelection = selectedRepos.filter((r) => r !== repo.name);
        } else {
            updatedSelection.push(repo.name);
        }
        setSelectedRepos(updatedSelection);

        if (!token) return;

        // Fetch Branches & PRs
        try {
            const [branchesRes, prRes] = await Promise.all([
                axios.get(`http://localhost:5000/branches/${repo.owner.login}/${repo.name}?token=${token}`),
                axios.get(`http://localhost:5000/pulls/${repo.owner.login}/${repo.name}?token=${token}`)
            ]);

            setRepoData((prev) => ({
                ...prev,
                [repo.name]: {
                    branches: branchesRes.data.branches || [],
                    pullRequests: prRes.data.pullRequests || []
                },
            }));
        } catch (error) {
            console.error(`❌ Error fetching repo data for ${repo.name}:`, error.response?.data || error.message);
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
                    <h2 className="text-2xl font-bold mb-4">Repositories</h2>
                    <button className="bg-green-500 text-white px-4 py-2 rounded mb-4" onClick={fetchRepos}>
                        Fetch Repositories
                    </button>

                    {/* ✅ Repositories List */}
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {repos.map((repo) => (
                            <li
                                key={repo.id}
                                onClick={() => handleToggleRepo(repo)}
                                className={`p-4 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300 ${
                                    selectedRepos.includes(repo.name) ? "border-2 border-blue-500" : ""
                                }`}
                            >
                                {repo.name}
                            </li>
                        ))}
                    </ul>

                    {/* ✅ Display Selected Repositories & Data in Cards */}
                    {selectedRepos.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            {selectedRepos.map((repoName) => (
                                <div key={repoName} className="bg-gray-100 p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-bold mb-4">{repoName}</h3>

                                    <h4 className="font-bold mt-2">Branches:</h4>
                                    <ul className="ml-4">
                                        {repoData[repoName]?.branches?.length > 0 ? (
                                            repoData[repoName].branches.map((branch) => (
                                                <li key={branch.name} className="text-gray-700">
                                                    {branch.name}
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No branches found.</p>
                                        )}
                                    </ul>

                                    <h4 className="font-bold mt-2">Pull Requests:</h4>
                                    <ul className="ml-4">
                                        {repoData[repoName]?.pullRequests?.length > 0 ? (
                                            repoData[repoName].pullRequests.map((pr) => (
                                                <li key={pr.url} className="text-gray-700">
                                                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                                        {pr.title} ({pr.state})
                                                    </a>
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No PRs found.</p>
                                        )}
                                    </ul>

                                    {/* ✅ Dashboard Component for this Repo */}
                                    <Dashboard selectedRepos={[repoName]} token={token} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MainApp;
