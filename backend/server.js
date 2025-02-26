const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ✅ GitHub OAuth Authentication
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: 'http://localhost:5000/auth/github/callback',
            scope: ['repo'],
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, { profile, accessToken });
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    res.redirect(`http://localhost:3000/dashboard?token=${req.user.accessToken}`);
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// ✅ Fetch Repositories
app.get('/repos', async (req, res) => {
    const { token } = req.query;
    try {
        const response = await axios.get(`https://api.github.com/user/repos?timestamp=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        res.json(response.data);
    } catch (error) {
        console.error("❌ Error fetching repositories:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch Branches for a Selected Repository
app.get('/branches/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const { token } = req.query;

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?timestamp=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const branches = response.data.map(branch => ({
            name: branch.name,
            commit_sha: branch.commit.sha,
            commit_url: branch.commit.url,
        }));

        res.json({ branches });
    } catch (error) {
        console.error(`❌ Error fetching branches for ${repo}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch Pull Requests for a Selected Repository
app.get('/pulls/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const { token } = req.query;

    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&timestamp=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const pullRequests = response.data.map(pr => ({
            id: pr.id,
            title: pr.title,
            state: pr.state,
            created_at: pr.created_at,
            merged_at: pr.merged_at,
            user: pr.user ? pr.user.login : "Unknown",
            url: pr.html_url
        }));

        res.json({ pullRequests });
    } catch (error) {
        console.error(`❌ Error fetching PRs for ${repo}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch PR Trends & Branch Activity
app.get('/metrics/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;
    const { token, range } = req.query;

    try {
        const now = new Date();
        const startDate = new Date();
        if (range === "6months") {
            startDate.setMonth(now.getMonth() - 6);
        } else {
            startDate.setMonth(now.getMonth() - 3);
        }

        // 🔹 Fetch PRs
        const prResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100&timestamp=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const prTrends = {};
        let totalMergeTime = 0;
        let mergedPRCount = 0;

        prResponse.data.forEach(pr => {
            if (pr.merged_at) {
                const mergedAt = new Date(pr.merged_at);
                if (mergedAt >= startDate) {
                    const week = `${mergedAt.getFullYear()}-W${Math.ceil(mergedAt.getDate() / 7)}`;
                    prTrends[week] = (prTrends[week] || 0) + 1;

                    const createdAt = new Date(pr.created_at);
                    totalMergeTime += (mergedAt - createdAt) / (1000 * 60 * 60 * 24); // Convert to days
                    mergedPRCount++;
                }
            }
        });

        const avgMergeTime = mergedPRCount > 0 ? (totalMergeTime / mergedPRCount).toFixed(2) : 0;

        // 🔹 Fetch Branch Activity
        const branchesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches?timestamp=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const branchActivity = [{
            date: startDate.toISOString().split('T')[0],
            branches_created: branchesResponse.data.length,
            branches_deleted: 0  // GitHub API doesn’t track deleted branches
        }];

        res.json({
            pr_trends: Object.keys(prTrends).map(week => ({ week, pr_count: prTrends[week] })),
            avg_merge_time: avgMergeTime,
            branch_activity: branchActivity
        });
    } catch (error) {
        console.error(`❌ Error fetching metrics for ${repo}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GitHub API Rate Limit Handler
app.use((err, req, res, next) => {
    if (err.response && err.response.status === 403) {
        console.error("🚨 GitHub API Rate Limit Exceeded");
        return res.status(403).json({ error: "GitHub API rate limit exceeded. Try again later." });
    }
    next(err);
});

// ✅ Fetch Individual Developer PR & Branch Activity
app.get('/developer-metrics/:owner/:repo/:developer', async (req, res) => {
    const { owner, repo, developer } = req.params;
    const { token, range } = req.query;

    try {
        const now = new Date();
        const startDate = new Date();
        if (range === "6months") {
            startDate.setMonth(now.getMonth() - 6);
        } else {
            startDate.setMonth(now.getMonth() - 3);
        }

        // 🔹 Fetch PRs for the Developer
        const prResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const individualPrTrends = {};
        let totalMergeTime = 0;
        let mergeCount = 0;

        prResponse.data.forEach(pr => {
            if (pr.user && pr.user.login === developer) {
                const mergedAt = new Date(pr.merged_at || pr.closed_at);
                const createdAt = new Date(pr.created_at);
                if (mergedAt >= startDate) {
                    const week = `${mergedAt.getFullYear()}-W${Math.ceil(mergedAt.getDate() / 7)}`;
                    individualPrTrends[week] = (individualPrTrends[week] || 0) + 1;

                    // Calculate PR merge time
                    totalMergeTime += (mergedAt - createdAt) / (1000 * 60 * 60 * 24);
                    mergeCount++;
                }
            }
        });

        const avgMergeTime = mergeCount ? (totalMergeTime / mergeCount).toFixed(2) : 0;

        res.json({
            individual_pr_trends: Object.keys(individualPrTrends).map(week => ({
                week,
                pr_count: individualPrTrends[week],
            })),
            avg_merge_time: avgMergeTime
        });

    } catch (error) {
        console.error(`❌ Error fetching developer metrics for ${developer}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});


app.listen(5000, () => console.log('✅ Server running on port 5000'));
