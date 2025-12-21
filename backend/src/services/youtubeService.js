import { GoogleGenerativeAI } from '@google/generative-ai';

// YouTube Channel Config - Study Wise Banking
const YOUTUBE_CHANNEL = {
    name: 'Study Wise Banking',
    handle: '@StudyWiseBanking',
    channelId: 'UC_qgYlJ94_hzjdYyJdZELLA', // Will be fetched dynamically
    tutorName: 'Bharat Sir'
};

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

        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch YouTube RSS feed');
        }

        const xmlText = await response.text();

        // Parse XML to extract video info
        const videos = parseYouTubeRSS(xmlText);
        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
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
            return rankVideosByRelevance(videoCache.videos, weakAreas, limit);
        }

        // Fetch fresh videos
        console.log('Fetching fresh videos from YouTube channel...');

        // Try to get channel ID from handle (this would need the YouTube API)
        // For now, we'll use the RSS feed with a known channel ID
        // The channel ID for @StudyWiseBanking needs to be determined

        // Alternative: Use channel page to find channel ID
        const channelId = await getChannelIdFromHandle('@StudyWiseBanking');

        if (!channelId) {
            console.error('Could not determine channel ID');
            return { videos: [], recommendedCount: 0, weakSubjects: weakAreas };
        }

        let videos = await fetchChannelVideos(channelId);

        if (videos.length === 0) {
            console.log('No videos fetched, returning empty');
            return { videos: [], recommendedCount: 0, weakSubjects: weakAreas };
        }

        // Categorize videos using AI
        videos = await categorizeVideosWithAI(videos);

        // Update cache
        videoCache.videos = videos;
        videoCache.lastFetched = now;

        return rankVideosByRelevance(videos, weakAreas, limit);
    } catch (error) {
        console.error('Error getting personalized videos:', error);
        return { videos: [], recommendedCount: 0, weakSubjects: weakAreas };
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
 * This is a workaround since YouTube doesn't provide a direct API for this
 */
async function getChannelIdFromHandle(handle) {
    try {
        // Try to fetch channel page and extract channel ID
        const channelUrl = `https://www.youtube.com/${handle}`;
        const response = await fetch(channelUrl);

        if (!response.ok) {
            throw new Error('Could not fetch channel page');
        }

        const html = await response.text();

        // Extract channel ID from meta tags or page content
        const channelIdMatch = html.match(/"channelId":"([^"]+)"/);
        if (channelIdMatch) {
            return channelIdMatch[1];
        }

        // Alternative pattern
        const altMatch = html.match(/channel_id=([a-zA-Z0-9_-]+)/);
        if (altMatch) {
            return altMatch[1];
        }

        // Hardcoded fallback for StudyWiseBanking channel
        // You can update this after finding the actual channel ID
        return 'UCPHvXcRhfDGpFFWJ0_Ns4BQ'; // Placeholder - needs to be verified

    } catch (error) {
        console.error('Error getting channel ID:', error);
        // Return a fallback channel ID (needs to be updated with actual ID)
        return 'UCPHvXcRhfDGpFFWJ0_Ns4BQ';
    }
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
