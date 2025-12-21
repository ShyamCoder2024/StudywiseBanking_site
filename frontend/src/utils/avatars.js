// Unified Avatar System - 70 Premium DiceBear "Adventurer" Avatars
// These avatars are consistent across ProfilePage, Navbar, and Leaderboard.

// Curated 70 unique avatar seeds for diverse, premium-looking characters
const avatarSeeds = [
    // Row 1-2: Classic Names
    'Felix', 'Aneka', 'Yo', 'Precious', 'Cuddles',
    'Shadow', 'Misty', 'Whiskers', 'Coco', 'Sparky',
    'Bailey', 'Ginger', 'Snowball', 'Dusty', 'Lucky',
    'Simon', 'Garfield', 'Oreo', 'Sassy', 'Abby',
    // Row 3-4: Pet Names
    'Bandit', 'Jasper', 'Tigger', 'Simba', 'Peanut',
    'Casper', 'Midnight', 'Rocky', 'Toby', 'Lola',
    'Bella', 'Max', 'Charlie', 'Jack', 'Daisy',
    'Luna', 'Milo', 'Oliver', 'Leo', 'Buddy',
    // Row 5-6: Character Names
    'Star', 'Cookie', 'Pepper', 'Bubbles', 'Patches',
    'Socks', 'Pumpkin', 'Maple', 'Willow', 'Scout',
    'Biscuit', 'Mocha', 'Hazel', 'Rusty', 'Diesel',
    'Maverick', 'Sage', 'Finn', 'Atlas', 'Aurora',
    // Row 7: More Unique Names
    'Pixel', 'Nova', 'Cosmo', 'Ziggy', 'Phoenix',
    'Blaze', 'Storm', 'Breeze', 'River', 'Ember'
];

// Premium pastel background colors for a soft, premium look
const bgColors = [
    'b6e3f4', 'c0aede', 'd1d4f9', 'ffdfbf', 'ffd5dc',
    'f0f4f8', 'e2e8f0', 'fed7aa', 'fbcfe8', 'bfdbfe'
];

// Generate the 70 avatars
const generateAvatars = () => {
    const avatars = [];
    for (let i = 0; i < 70; i++) {
        const seed = avatarSeeds[i % avatarSeeds.length];
        const bg = bgColors[i % bgColors.length];
        avatars.push({
            id: `k-avatar-${i + 1}`,
            url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}&radius=10`
        });
    }
    return avatars;
};

export const CARTOON_AVATARS = generateAvatars();

// Get avatar by ID (e.g., 'k-avatar-5')
export const getAvatarById = (id) => {
    return CARTOON_AVATARS.find(a => a.id === id) || CARTOON_AVATARS[0];
};

// Get avatar by index (0-69)
export const getAvatarByIndex = (index) => {
    return CARTOON_AVATARS[index % CARTOON_AVATARS.length];
};

// Get a random avatar
export const getRandomAvatar = () => {
    return CARTOON_AVATARS[Math.floor(Math.random() * CARTOON_AVATARS.length)];
};

export default CARTOON_AVATARS;
