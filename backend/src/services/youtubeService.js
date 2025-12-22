import { GoogleGenerativeAI } from '@google/generative-ai';

// YouTube Channel Config - Study Wise Banking
// Channel URL: https://www.youtube.com/@studywisebanking
const YOUTUBE_CHANNEL = {
    name: 'Study Wise Banking',
    handle: '@studywisebanking',
    channelUrl: 'https://www.youtube.com/@studywisebanking',
    // List of possible channel IDs to try (YouTube RSS requires channel ID)
    channelIds: [
        'UCvJmB4b_K6_Q7Q8x3c9Y7Zg',  // Potential ID
        'UCPHvXcRhfDGpFFWJ0_Ns4BQ',  // Alternative
        'UC_qgYlJ94_hzjdYyJdZELLA',  // Alternative
    ],
    tutorName: 'Bharat Sir'
};

// Fallback static videos when YouTube fetch fails
// These link directly to the channel
const FALLBACK_VIDEOS = [
    {
        youtubeId: 'channel-link-1',
        title: 'Banking Awareness Complete Course - RBI, SEBI, NABARD',
        publishedAt: new Date(),
        thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        watchUrl: 'https://www.youtube.com/@studywisebanking',
        tutorName: 'Bharat Sir',
        subject: 'BANKING',
        isRecommended: true
    },
    {
        youtubeId: 'channel-link-2',
        title: 'Quantitative Aptitude Tricks - Speed Math for Bank Exams',
        publishedAt: new Date(),
        thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        watchUrl: 'https://www.youtube.com/@studywisebanking',
        tutorName: 'Bharat Sir',
        subject: 'MATH',
        isRecommended: false
    },
    {
        youtubeId: 'channel-link-3',
        title: 'Reasoning Puzzles Masterclass - Seating Arrangement',
        publishedAt: new Date(),
        thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        watchUrl: 'https://www.youtube.com/@studywisebanking',
        tutorName: 'Bharat Sir',
        subject: 'REASONING',
        isRecommended: false
    },
    {
        youtubeId: 'channel-link-4',
        title: 'Current Affairs December 2024 - Banking Exams Special',
        publishedAt: new Date(),
        thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        watchUrl: 'https://www.youtube.com/@studywisebanking',
        tutorName: 'Bharat Sir',
        subject: 'GK',
        isRecommended: false
    },
    {
        youtubeId: 'channel-link-5',
        title: 'English Grammar for Bank Exams - Error Spotting',
        publishedAt: new Date(),
        thumbnailUrl: 'https://i.ytimg.com/vi/default/hqdefault.jpg',
        watchUrl: 'https://www.youtube.com/@studywisebanking',
        tutorName: 'Bharat Sir',
        subject: 'ENGLISH',
        isRecommended: false
    }
];

// Subject keywords for AI categorization
const SUBJECTS = {
    MATH: ['math', 'calculation', 'number', 'algebra', 'arithmetic', 'simplification', 'percentage', 'ratio', 'proportion', 'profit', 'loss', 'SI', 'CI', 'interest', 'speed', 'time', 'distance', 'average', 'mixture'],
    REASONING: ['reasoning', 'puzzle', 'seating', 'arrangement', 'syllogism', 'coding', 'decoding', 'blood', 'relation', 'direction', 'inequality', 'order', 'ranking'],
    ENGLISH: ['english', 'grammar', 'vocabulary', 'comprehension', 'error', 'fill', 'blank', 'cloze', 'sentence'],
    GK: ['GK', 'current', 'affairs', 'static', 'awareness', 'news', 'history', 'geography', 'polity'],
    QUANT: ['quant', 'data', 'interpretation', 'DI', 'chart', 'graph', 'table', 'caselet'],
    BANKING: ['banking', 'bank', 'RBI', 'SEBI', 'financial', 'economy', 'budget', 'policy', 'SBI', 'IBPS', 'RRB']
};

// Cache for videos (in-memory, could be moved to DB for persistence)
let videoCache = {
    videos: [],
    lastFetched: null,
    cacheExpiry: 6 * 60 * 60 * 1000 // 6 hours
};

/**
 * Fetch videos from YouTube channel using RSS feed
 * No API key required for public feeds
 */
export async function fetchChannelVideos(channelId) {
    try {
        // YouTube RSS feed URL
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

        const response = await fetch(rssUrl, {
            headers: {
                'Accept': 'application/xml, text/xml',
                'User-Agent': 'StudyWiseBanking/1.0'
            }
        });

        if (!response.ok) {
            console.error(`YouTube RSS fetch failed with status: ${response.status}`);
            throw new Error('Failed to fetch YouTube RSS feed');
        }

        const xmlText = await response.text();

        // Check if we got valid XML
        if (!xmlText.includes('<feed') || !xmlText.includes('<entry>')) {
            console.error('Invalid RSS response - no feed/entries found');
            return [];
        }

        const videos = parseYouTubeRSS(xmlText);
        console.log(`Successfully fetched ${videos.length} videos from YouTube`);
        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error.message);
        return [];
    }
}

/**
 * Parse YouTube RSS XML to extract video details
 */
function parseYouTubeRSS(xmlText) {
    const videos = [];

    // Extract entries using regex (simple approach without XML parser dependency)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const videoIdRegex = /<yt:videoId>([\s\S]*?)<\/yt:videoId>/;
    const publishedRegex = /<published>([\s\S]*?)<\/published>/;
    const thumbnailRegex = /<media:thumbnail url="([^"]+)"/;

    let match;
    while ((match = entryRegex.exec(xmlText)) !== null) {
        const entry = match[1];

        const titleMatch = entry.match(titleRegex);
        const videoIdMatch = entry.match(videoIdRegex);
        const publishedMatch = entry.match(publishedRegex);
        const thumbnailMatch = entry.match(thumbnailRegex);

        if (titleMatch && videoIdMatch) {
            videos.push({
                youtubeId: videoIdMatch[1].trim(),
                title: titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
                publishedAt: publishedMatch ? new Date(publishedMatch[1].trim()) : new Date(),
                thumbnailUrl: thumbnailMatch
                    ? thumbnailMatch[1]
                    : `https://img.youtube.com/vi/${videoIdMatch[1].trim()}/maxresdefault.jpg`,
                watchUrl: `https://www.youtube.com/watch?v=${videoIdMatch[1].trim()}`,
                tutorName: YOUTUBE_CHANNEL.tutorName,
                subject: null, // Will be categorized by AI
                isRecommended: false
            });
        }
    }

    return videos;
}

/**
 * Use Gemini AI to categorize videos based on their titles
 */
export async function categorizeVideosWithAI(videos) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const categorizedVideos = [];

        // Process videos in batches for efficiency
        const batchSize = 10;
        for (let i = 0; i < videos.length; i += batchSize) {
            const batch = videos.slice(i, i + batchSize);
            const titles = batch.map((v, idx) => `${idx + 1}. ${v.title}`).join('\n');

            const prompt = `You are categorizing educational videos for banking exam preparation.

For each video title below, respond with ONLY the number and category (one per line):
Categories: MATH, REASONING, ENGLISH, GK, QUANT, BANKING, GENERAL

Video titles:
${titles}

Example response format:
1. MATH
2. REASONING
3. GK`;

            try {
                const result = await model.generateContent(prompt);
                const response = result.response.text();

                // Parse AI response
                const lines = response.split('\n').filter(l => l.trim());
                lines.forEach((line, idx) => {
                    if (idx < batch.length) {
                        const category = line.replace(/^\d+\.?\s*/, '').trim().toUpperCase();
                        const validCategories = ['MATH', 'REASONING', 'ENGLISH', 'GK', 'QUANT', 'BANKING', 'GENERAL'];
                        batch[idx].subject = validCategories.includes(category) ? category : 'GENERAL';
                    }
                });

                categorizedVideos.push(...batch);
            } catch (aiError) {
                console.error('AI categorization error:', aiError);
                // Fallback to keyword-based categorization
                batch.forEach(video => {
                    video.subject = categorizeByKeywords(video.title);
                });
                categorizedVideos.push(...batch);
            }

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < videos.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return categorizedVideos;
    } catch (error) {
        console.error('AI categorization failed:', error);
        // Fallback to keyword-based categorization
        return videos.map(v => ({
            ...v,
            subject: categorizeByKeywords(v.title)
        }));
    }
}

/**
 * Fallback: Categorize video by keywords in title
 */
function categorizeByKeywords(title) {
    const lowerTitle = title.toLowerCase();

    for (const [subject, keywords] of Object.entries(SUBJECTS)) {
        for (const keyword of keywords) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                return subject;
            }
        }
    }

    return 'GENERAL';
}

/**
 * Get personalized video recommendations for a student
 * @param {Array} weakAreas - Student's weak subjects/areas
 * @param {number} limit - Max videos to return
 */
export async function getPersonalizedVideos(weakAreas = [], limit = 20) {
    try {
        // Check cache first
        const now = Date.now();
        if (videoCache.videos.length > 0 &&
            videoCache.lastFetched &&
            (now - videoCache.lastFetched) < videoCache.cacheExpiry) {
            console.log('Returning cached videos');
            return rankVideosByRelevance(videoCache.videos, weakAreas, limit);
        }

        // Fetch fresh videos - try all channel IDs
        console.log('Fetching fresh videos from YouTube channel...');

        let videos = [];

        // Try each channel ID until one works
        for (const channelId of YOUTUBE_CHANNEL.channelIds) {
            console.log(`Trying channel ID: ${channelId}`);
            videos = await fetchChannelVideos(channelId);
            if (videos.length > 0) {
                console.log(`Success! Found ${videos.length} videos with channel ID: ${channelId}`);
                break;
            }
        }

        // If no videos from any channel, use fallback
        if (videos.length === 0) {
            console.log('No videos fetched from any YouTube channel, using fallback videos');
            videos = [...FALLBACK_VIDEOS];

            const result = rankVideosByRelevance(videos, weakAreas, limit);
            return {
                ...result,
                aiPowered: false,
                isFallback: true,
                message: 'Showing sample videos. Visit our YouTube channel for more content.'
            };
        }

        // Categorize videos using AI
        videos = await categorizeVideosWithAI(videos);

        // Update cache
        videoCache.videos = videos;
        videoCache.lastFetched = now;

        const result = rankVideosByRelevance(videos, weakAreas, limit);
        return { ...result, aiPowered: true, isFallback: false };
    } catch (error) {
        console.error('Error getting personalized videos:', error);
        // Return fallback videos on error
        const result = rankVideosByRelevance(FALLBACK_VIDEOS, weakAreas, limit);
        return {
            ...result,
            aiPowered: false,
            isFallback: true,
            message: 'Showing sample videos due to an error. Please try refreshing.'
        };
    }
}

/**
 * Rank videos by relevance to student's weak areas
 */
function rankVideosByRelevance(videos, weakAreas, limit) {
    const weakSubjectsUpper = weakAreas.map(w => w.toUpperCase());

    // Mark recommended videos
    const rankedVideos = videos.map(video => ({
        ...video,
        isRecommended: weakSubjectsUpper.includes(video.subject?.toUpperCase())
    }));

    // Sort: recommended first (by date), then others (by date)
    const recommended = rankedVideos
        .filter(v => v.isRecommended)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const others = rankedVideos
        .filter(v => !v.isRecommended)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    const sortedVideos = [...recommended, ...others].slice(0, limit);

    return {
        videos: sortedVideos,
        recommendedCount: recommended.length,
        weakSubjects: weakAreas,
        totalVideos: videos.length
    };
}

/**
 * Get channel ID from YouTube handle
 * This function is kept for potential future use but 
 * we now use hardcoded channel ID for reliability
 * @deprecated Use YOUTUBE_CHANNEL.channelId instead
 */
async function getChannelIdFromHandle(handle) {
    // Return hardcoded ID for reliability
    return YOUTUBE_CHANNEL.channelId;
}

/**
 * Clear the video cache to force a refresh
 */
export function clearVideoCache() {
    videoCache.videos = [];
    videoCache.lastFetched = null;
}

export default {
    fetchChannelVideos,
    categorizeVideosWithAI,
    getPersonalizedVideos,
    clearVideoCache,
    YOUTUBE_CHANNEL
};
