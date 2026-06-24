export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const COLORS = {
    background: '#0f0f23',
    backgroundGrid: '#151530',
    player: '#00d4ff',
    playerStroke: '#0088cc',
    playerGlow: 'rgba(0,212,255,0.3)',
    enemy_basic: '#ff4466',
    enemy_fast: '#ff8833',
    enemy_tank: '#aa44ff',
    enemy_ranged: '#44dd44',
    enemy_swarm: '#ff44aa',
    boss: '#ffdd00',
    xpGem: '#44ff88',
    coin: '#ffd700',
    projectile_player: '#00ffcc',
    projectile_enemy: '#ff6644',
    hpBar: '#ff3333',
    hpBg: '#331111',
    xpBar: '#33ccff',
    xpBg: '#112244',
    uiPanel: 'rgba(10,10,30,0.85)',
    uiText: '#ffffff',
    uiAccent: '#00d4ff',
    uiWarning: '#ff6666',
    damageNumber: '#ff7777',
    healNumber: '#44ff44',
    pickupRange: 'rgba(0,212,255,0.15)',
};

export const PLAYER = {
    radius: 16,
    baseSpeed: 220,
    baseMaxHP: 100,
    baseRegen: 0,
    invincibilityTime: 0.3,
    pickupRange: 70,
    xpMagnetRange: 0,
    collisionDamage: 10,
};

export const ENEMY_TYPES = {
    basic: {
        name: 'basic',
        radius: 14,
        speed: 80,
        hp: 20,
        damage: 15,
        xp: 10,
        coins: 1,
        color: COLORS.enemy_basic,
        strokeColor: '#cc2244',
    },
    fast: {
        name: 'fast',
        radius: 10,
        speed: 170,
        hp: 10,
        damage: 10,
        xp: 15,
        coins: 2,
        color: COLORS.enemy_fast,
        strokeColor: '#cc5500',
    },
    tank: {
        name: 'tank',
        radius: 22,
        speed: 45,
        hp: 80,
        damage: 25,
        xp: 30,
        coins: 5,
        color: COLORS.enemy_tank,
        strokeColor: '#7722cc',
    },
    ranged: {
        name: 'ranged',
        radius: 13,
        speed: 60,
        hp: 25,
        damage: 12,
        xp: 20,
        coins: 3,
        color: COLORS.enemy_ranged,
        strokeColor: '#228822',
        attackRange: 250,
        attackCooldown: 2.0,
        projectileSpeed: 180,
        projectileRadius: 4,
    },
    swarm: {
        name: 'swarm',
        radius: 7,
        speed: 150,
        hp: 5,
        damage: 8,
        xp: 5,
        coins: 1,
        color: COLORS.enemy_swarm,
        strokeColor: '#cc2288',
    },
    boss: {
        name: 'boss',
        radius: 40,
        speed: 40,
        hp: 500,
        damage: 40,
        xp: 200,
        coins: 50,
        color: COLORS.boss,
        strokeColor: '#ccaa00',
        attackRange: 300,
        attackCooldown: 1.5,
        projectileSpeed: 140,
        projectileRadius: 8,
        projectileCount: 8,
    },
};

export const XP_REQUIRED_BASE = 10;
export const XP_REQUIRED_SCALE = 1.15;

export const WAVE_DURATION = 30;
export const MAX_WAVES = 20;
export const BOSS_INTERVAL_WAVES = 5;

export const PICKUP_RADIUS = 8;
export const PICKUP_LIFETIME = 30;

export const GAME_STATES = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    UPGRADING: 'upgrading',
    PAUSED: 'paused',
    DEAD: 'dead',
};

export const UPGRADE_CATEGORIES = {
    NEW_WEAPON: 'new_weapon',
    WEAPON_UPGRADE: 'weapon_upgrade',
    STAT: 'stat',
};

export const SHOP_ITEMS = [
    { id: 'maxHp', name: 'Max HP', desc: '+20 HP per level', maxLevel: 10, baseCost: 50, costScale: 1.4, icon: '+', color: '#ff4444' },
    { id: 'damage', name: 'Damage', desc: '+10% damage', maxLevel: 10, baseCost: 60, costScale: 1.5, icon: '!', color: '#ff8844' },
    { id: 'speed', name: 'Speed', desc: '+5% move speed', maxLevel: 5, baseCost: 80, costScale: 1.6, icon: '>', color: '#ffdd44' },
    { id: 'xpGain', name: 'XP Gain', desc: '+10% XP earned', maxLevel: 5, baseCost: 70, costScale: 1.5, icon: '=', color: '#44ff44' },
    { id: 'coinGain', name: 'Coin Gain', desc: '+10% coins', maxLevel: 5, baseCost: 60, costScale: 1.5, icon: '$', color: '#ffd700' },
    { id: 'pickupRange', name: 'Pickup', desc: '+10% pickup range', maxLevel: 5, baseCost: 40, costScale: 1.4, icon: 'O', color: '#44ddff' },
    { id: 'regen', name: 'Regen', desc: '+1 HP/sec regen', maxLevel: 5, baseCost: 100, costScale: 1.6, icon: '+', color: '#ff44ff' },
    { id: 'armor', name: 'Armor', desc: '-5% damage taken', maxLevel: 5, baseCost: 90, costScale: 1.6, icon: '#', color: '#8888ff' },
];

Object.assign(COLORS, {
    white: '#ffffff',
    whiteAlpha: 'rgba(255,255,255,0.7)',
    gold: '#ffd700',
    danger: '#ff3333',
    warning: '#ff8844',
    title: '#00d4ff',
    glowYellow: 'rgba(255,215,0,0.6)',
    muted: 'rgba(255,255,255,0.3)',
    mutedLight: 'rgba(255,255,255,0.5)',
    weapon: '#00d4ff',
    statUp: '#44ff44',
    cardBg: 'rgba(15,15,35,0.95)',
    cardBorder: 'rgba(0,212,255,0.3)',
    cardBorderSelected: '#00d4ff',
    glowGold: 'rgba(255,215,0,0.7)',
    darkOverlay: 'rgba(0,0,0,0.75)',
    uiPanelLight: 'rgba(20,20,50,0.9)',
    xp: '#33ccff',
});

export const CHARACTERS = [
    { id: 'warrior', name: 'Warrior', desc: 'Balanced fighter', color: '#00d4ff', hpBonus: 0, speedBonus: 0, damageBonus: 0, startingWeapon: 'magicBolt' },
    { id: 'rogue', name: 'Rogue', desc: 'Fast but fragile', color: '#44ff44', hpBonus: -20, speedBonus: 0.3, damageBonus: 0.2, startingWeapon: 'boomerang', unlockCost: 200 },
    { id: 'mage', name: 'Mage', desc: 'Powerful, slow, fragile', color: '#ff44ff', hpBonus: -30, speedBonus: -0.1, damageBonus: 0.5, startingWeapon: 'iceShards', unlockCost: 500 },
];
