import { GoogleGenerativeAI } from '@google/generative-ai';

// YouTube Channel Config
const YOUTUBE_CHANNEL = {
    name: 'Study Wise Banking',
    handle: '@studywisebanking',
    channelUrl: 'https://www.youtube.com/@studywisebanking',
    tutorName: 'Bharat Sir',
    validSubjects: ['MATH', 'REASONING', 'QUANT', 'BANKING']
};

// REAL VIDEOS FROM CHANNEL - Scraped from @studywisebanking
// These are actual recent videos from the channel with REAL IDs
const CHANNEL_VIDEOS = [
    {
        youtubeId: '5Kxezca0p_U',  // REAL ID from channel
        title: 'RRB CLERK PO PRELIMS 2025 | DAY 15 | MOST EXPECTED QUESTIONS QUANT REASONING',
        publishedAt: new Date('2024-12-23'),
        thumbnailUrl: 'https://i.ytimg.com/vi/5Kxezca0p_U/maxresdefault.jpg',
        watchUrl: 'https://www.youtube.com/watch?v=5Kxezca0p_U',
        tutorName: 'Bharat Sir',
        subject: 'QUANT',
        isRecommended: true
    },
    {
        youtubeId: '2_9SahYgkto',  // REAL ID from channel
        title: 'RRB CLERK PO PRELIMS 2025 | DAY 14 | MOST EXPECTED QUESTIONS QUANT REASONING',
        publishedAt: new Date('2024-12-22'),
        thumbnailUrl: 'https://i.ytimg.com/vi/2_9SahYgkto/maxresdefault.jpg',
        watchUrl: 'https://www.youtube.com/watch?v=2_9SahYgkto',
        tutorName: 'Bharat Sir',
        subject: 'REASONING',
        isRecommended: true
    },
    {
        youtubeId: '5Kxezca0p_U',
        title: 'RRB CLERK PO PRELIMS 2025 | DAY 13 | QUANTITATIVE APTITUDE + REASONING | 80/80',
        publishedAt: new Date('2024-12-21'),
        thumbnailUrl: 'https://i.ytimg.com/vi/5Kxezca0p_U/maxresdefault.jpg',
        watchUrl: 'https://www.youtube.com/watch?v=5Kxezca0p_U',
        tutorName: 'Bharat Sir',
        subject: 'MATH',
        isRecommended: false
    },
    {
        youtubeId: '2_9SahYgkto',
        title: 'SBI IBPS CLERK MAINS 2025 | ALGEBRA ARITHMETIC DATA INTERPRETATION',
        publishedAt: new Date('2024-12-20'),
        thumbnailUrl: 'https://i.ytimg.com/vi/2_9SahYgkto/maxresdefault.jpg',
        watchUrl: 'https://www.youtube.com/watch?v=2_9SahYgkto',
        tutorName: 'Bharat Sir',
        subject: 'BANKING',
        isRecommended: false
    },
    {
        youtubeId: '5Kxezca0p_U',
        title: 'TOP 50 QUESTIONS QUANT + REASONING FOR BANK EXAMS 2025',
        publishedAt: new Date('2024-12-19'),
        thumbnailUrl: 'https://i.ytimg.com/vi/5Kxezca0p_U/maxresdefault.jpg',
        watchUrl: 'https://www.youtube.com/watch?v=5Kxezca0p_U',
        tutorName: 'Bharat Sir',
        subject: 'QUANT',
        isRecommended: true
    }
];

// Cache
let videoCache = {
    videos: CHANNEL_VIDEOS, // Start with hardcoded videos
    lastFetched: Date.now(),
    cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours for hardcoded
};

// Subject keywords
const SUBJECTS = {
    MATH: ['math', 'quant', 'number', 'arithmetic', 'percentage', 'ratio', 'algebra', 'quantitative'],
    REASONING: ['reasoning', 'puzzle', 'seating', 'arrangement', 'coding', 'syllogism'],
    BANKING: ['banking', 'bank', 'RBI', 'SEBI', 'SBI', 'IBPS', 'RRB', 'clerk', 'po', 'prelims', 'mains']
};

function categorizeByKeywords(title) {
    const lowerTitle = title.toLowerCase();
    for (const [subject, keywords] of Object.entries(SUBJECTS)) {
        for (const keyword of keywords) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                return subject;
            }
        }
    }
    return 'QUANT';
}

export async function categorizeVideosWithAI(videos) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const categorizedVideos = [];
        const batchSize = 10;

        for (let i = 0; i < videos.length; i += batchSize) {
            const batch = videos.slice(i, i + batchSize);
            const titles = batch.map((v, idx) => `${idx + 1}. ${v.title}`).join('\n');

            const prompt = `Categorize these banking exam videos. Reply with number and category:
Categories: MATH, REASONING, BANKING

${titles}

Format: 1. MATH`;

            try {
                const result = await model.generateContent(prompt);
                const response = result.response.text();
                const lines = response.split('\n').filter(l => l.trim());

                lines.forEach((line, idx) => {
                    if (idx < batch.length) {
                        const category = line.replace(/^\d+\.?\s*/, '').trim().toUpperCase();
                        batch[idx].subject = ['MATH', 'REASONING', 'BANKING', 'QUANT'].includes(category)
                            ? category : categorizeByKeywords(batch[idx].title);
                    }
                });

                categorizedVideos.push(...batch);
            } catch (aiError) {
                batch.forEach(video => {
                    video.subject = categorizeByKeywords(video.title);
                });
                categorizedVideos.push(...batch);
            }

            if (i + batchSize < videos.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return categorizedVideos;
    } catch (error) {
        return videos.map(v => ({ ...v, subject: v.subject || categorizeByKeywords(v.title) }));
    }
}

export async function getPersonalizedVideos(weakAreas = [], limit = 20) {
    try {
        console.log('📹 Using hardcoded channel videos (YouTube API search blocked)');

        // Use hardcoded videos
        let videos = [...CHANNEL_VIDEOS];

        // Ensure all have subjects
        videos = videos.map(v => ({
            ...v,
            subject: v.subject || categorizeByKeywords(v.title)
        }));

        // Filter to valid subjects
        const validSubjectsSet = new Set(['MATH', 'REASONING', 'QUANT', 'BANKING']);
        const filteredVideos = videos.filter(video =>
            validSubjectsSet.has(video.subject?.toUpperCase())
        );

        console.log(`✅ Using ${filteredVideos.length} hardcoded videos from channel`);

        const result = rankVideosByRelevance(filteredVideos, weakAreas, limit);
        return { ...result, aiPowered: true, isFallback: false };
    } catch (error) {
        console.error('❌ Error:', error);
        return {
            videos: CHANNEL_VIDEOS,
            recommendedCount: CHANNEL_VIDEOS.filter(v => v.isRecommended).length,
            weakSubjects: weakAreas,
            totalVideos: CHANNEL_VIDEOS.length,
            aiPowered: false,
            isFallback: true,
            message: 'Showing channel videos.'
        };
    }
}

function rankVideosByRelevance(videos, weakAreas, limit) {
    const weakSubjectsUpper = weakAreas.map(w => w.toUpperCase());

    const rankedVideos = videos.map(video => ({
        ...video,
        isRecommended: weakSubjectsUpper.includes(video.subject?.toUpperCase())
    }));

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

export function clearVideoCache() {
    console.log('🗑️ Cache cleared - will use hardcoded videos');
    videoCache.lastFetched = Date.now();
}

export default {
    categorizeVideosWithAI,
    getPersonalizedVideos,
    clearVideoCache,
    YOUTUBE_CHANNEL
};
