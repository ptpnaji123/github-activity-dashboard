import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from "recharts";

const Dashboard = ({ selectedRepos, token }) => {
    const [timeRange, setTimeRange] = useState("3months");
    const [metrics, setMetrics] = useState({});
    const [loadingRepos, setLoadingRepos] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedRepos.length === 0) return;
        fetchMetrics();
    }, [selectedRepos, timeRange]);

    const fetchMetrics = async () => {
        setLoadingRepos(prev => {
            const newLoading = {};
            selectedRepos.forEach(repo => newLoading[repo] = true);
            return newLoading;
        });
        setErrors({});

        try {
            const data = {};
            await Promise.all(
                selectedRepos.map(async (repo) => {
                    try {
                        const response = await axios.get(
                            `http://localhost:5000/metrics/ptpnaji123/${repo}?token=${token}&range=${timeRange}&_=${Date.now()}`
                        );
                        data[repo] = response.data;
                    } catch (error) {
                        console.error(`❌ Error fetching metrics for ${repo}:`, error);
                        setErrors(prev => ({ ...prev, [repo]: "Failed to fetch data." }));
                    } finally {
                        setLoadingRepos(prev => ({ ...prev, [repo]: false }));
                    }
                })
            );

            setMetrics(data);
        } catch (error) {
            console.error("❌ General Error Fetching Metrics:", error);
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">📊 Repository Dashboard</h2>

            {/* 🔹 Time Range Selection */}
            <div className="mb-4">
                <label className="font-bold">Time Range:</label>
                <select
                    className="ml-2 p-2 border rounded"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <option value="3months">Last 3 Months</option>
                    <option value="6months">Last 6 Months</option>
                </select>
            </div>

            {/* 🔹 Display Metrics for Each Repository */}
            {selectedRepos.map((repo) => (
                <div key={repo} className="mb-6">
                    <h3 className="text-xl font-bold mt-4">{repo}</h3>

                    {/* 🔹 Show Loading Indicator or Error Messages */}
                    {loadingRepos[repo] ? (
                        <p className="text-blue-500">Fetching data...</p>
                    ) : errors[repo] ? (
                        <p className="text-red-500">{errors[repo]}</p>
                    ) : (
                        <>
                            {/* 🔹 PR Trends */}
                            <h4 className="text-md font-bold mt-2">PR Trends</h4>
                            {metrics[repo]?.pr_trends?.length > 0 ? (
                                <LineChart width={800} height={300} data={metrics[repo].pr_trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pr_count" stroke="#8884d8" />
                                </LineChart>
                            ) : (
                                <p className="text-gray-500">No PR data available.</p>
                            )}

                            {/* 🔹 Average PR Merge Time */}
                            <h4 className="text-md font-bold mt-2">Average PR Merge Time (Days)</h4>
                            {metrics[repo]?.avg_merge_time ? (
                                <BarChart width={500} height={300} data={[{ repo, avg_merge_time: metrics[repo].avg_merge_time }]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="repo" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="avg_merge_time" fill="#FF5733" />
                                </BarChart>
                            ) : (
                                <p className="text-gray-500">No data available.</p>
                            )}

                            {/* 🔹 Branch Activity */}
                            <h4 className="text-md font-bold mt-2">Branch Activity</h4>
                            {metrics[repo]?.branch_activity?.length > 0 ? (
                                <LineChart width={800} height={300} data={metrics[repo].branch_activity}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="branches_created" stroke="#34D399" />
                                    <Line type="monotone" dataKey="branches_deleted" stroke="#EF4444" />
                                </LineChart>
                            ) : (
                                <p className="text-gray-500">No branch activity data available.</p>
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
