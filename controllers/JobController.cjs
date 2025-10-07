const JobTitle = require('../models/JobTitle.cjs');
const JobDetail = require('../models/JobDetail.cjs');
const express = require('express');
const router = express.Router();

router.get('/titles', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const keyword = req.query.keyword || '';
        const limit = 25;
        const skip = (page - 1) * limit;

        // Build search query based on whether keyword is provided
        let searchQuery = {};
        if (keyword && keyword.trim() !== '') {
            const searchRegex = new RegExp(keyword.trim(), 'i');
            searchQuery = {
                $or: [
                    { title: { $regex: searchRegex } },
                    { company: { $regex: searchRegex } },
                    { location: { $regex: searchRegex } }
                ]
            };
        }

        const titles = await JobTitle.find(searchQuery)
            .limit(limit)
            .skip(skip);

        const totalTitles = await JobTitle.countDocuments(searchQuery);
        
        res.status(200).json({
            titles,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTitles / limit),
                totalItems: totalTitles,
                itemsPerPage: limit,
                keyword: keyword
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/details/:id', async (req, res) => {
    try {
        const startTime = Date.now();
        const jobId = req.params.id;
        const cacheKey = `job_detail:${jobId}`;
        const cacheExpiry = 300; // 5 minutes in seconds

        // Reusable method to calculate retrieval time
        const getRetrievalTime = (isCached) => {
            const endTime = Date.now();
            const timeTaken = endTime - startTime;
            return isCached ? `cached ${timeTaken}ms` : `not cached ${timeTaken}ms`;
        };

        // Check Redis cache first
        try {
            const cachedJobDetail = await global.redisClient.get(cacheKey);
            
            if (cachedJobDetail) {
                const retrievalTime = getRetrievalTime(true);
                console.log(`✓ Cache hit for job ${jobId}`);
                return res.status(200).json({
                    ...JSON.parse(cachedJobDetail),
                    _cached: true,
                    _cacheTimestamp: new Date().toISOString(),
                    _retrievalInfo: retrievalTime
                });
            }
            
            console.log(`Cache miss for job ${jobId}, querying database`);
        } catch (cacheError) {
            console.warn('Redis cache read error:', cacheError.message);
        }
        
        // Query database
        const jobDetail = await JobDetail.findOne({ jobId: jobId });
        
        if (!jobDetail) {
            return res.status(404).json({ message: 'Job detail not found' });
        }

        // Cache the result in Redis
        try {
            await global.redisClient.setEx(cacheKey, cacheExpiry, JSON.stringify(jobDetail));
            console.log(`✓ Cached job ${jobId} for ${cacheExpiry} seconds`);
        } catch (cacheError) {
            console.warn('Redis cache write error:', cacheError.message);
        }

        const retrievalTime = getRetrievalTime(false);

        res.status(200).json({
            ...jobDetail.toObject(),
            _cached: false,
            _cacheTimestamp: new Date().toISOString(),
            _retrievalInfo: retrievalTime
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;