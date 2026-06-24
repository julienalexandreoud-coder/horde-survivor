import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, GAME_STATES, CHARACTERS, SHOP_ITEMS, XP_REQUIRED_BASE, XP_REQUIRED_SCALE, MAX_WAVES, BOSS_INTERVAL_WAVES } from './constants.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Player } from './entity/player.js';
import { EnemyPool } from './entity/pool.js';
import { Spawner } from './system/spawner.js';
import { CollisionSystem } from './system/collision.js';
import { UpgradeSystem } from './system/upgrade.js';
import { EffectsSystem } from './system/effects.js';
import { HUD } from './ui/hud.js';
import { MainMenu } from './ui/menu.js';
import { GameOverScreen } from './ui/gameover.js';
import { UpgradeChoice } from './ui/upgrade-choice.js';
import { ShopUI } from './ui/shop.js';
import { PauseMenu } from './ui/pause.js';
import { NotificationSystem } from './ui/notifications.js';
import { getSDK, SDK } from './sdk/crazygames.js';
import { WEAPONS } from './data/weapons.js';

const WORLD_MULTIPLIER = 3;

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.state = GAME_STATES.LOADING;
        this.renderer = new Renderer(canvas);
        this.input = new Input();
        this.worldWidth = CANVAS_WIDTH * WORLD_MULTIPLIER;
        this.worldHeight = CANVAS_HEIGHT * WORLD_MULTIPLIER;
        this.camera = { x: 0, y: 0 };
        this._loop = this._loop.bind(this);
        this._lastTimestamp = 0;
        this._rafId = null;
        this.deltaTime = 0;
        this._persistedData = null;
        this._coinBalance = 0;
        this._bestStats = { wave: 0, kills: 0, time: 0 };
        this._selectedCharacter = CHARACTERS[0];
        this._pendingAdMidgame = false;
        this._shopOpen = false;
        this._permLevels = {};
        this._unlocked = [];
    }

    async start() {
        try {
            this._persistedData = await SDK.data.load('horde_save');
            if (this._persistedData) {
                this._coinBalance = this._persistedData.coins || 0;
                this._bestStats = this._persistedData.best || { wave: 0, kills: 0, time: 0 };
            }
        } catch (e) { console.error('load data failed', e); }

        this.menu = new MainMenu(this.renderer, this.input);
        this.gameOverScreen = new GameOverScreen(this.renderer, this.input);
        this.pauseMenu = new PauseMenu(this.renderer, this.input);
        this.shopUI = new ShopUI(this.renderer, this.input);

        this.menu.onPlay = () => this.newGame();
        this.menu.onShop = () => { this._shopOpen = true; };

        this.gameOverScreen.onRetry = () => this.newGame();
        this.gameOverScreen.onMenu = () => { this._savePersisted(); this.changeState(GAME_STATES.MENU); };
        this.gameOverScreen.onRevive = () => this._handleRevive();
        this.gameOverScreen.onDoubleCoins = () => this._handleDoubleCoins();

        this.shopUI.onBuy = (id) => this._buyShopItem(id);
        this.shopUI.onBack = () => { this._shopOpen = false; };

        console.log('game starting, state:', this.state);
        this.changeState(GAME_STATES.MENU);
        this._lastTimestamp = performance.now();
        this._rafId = requestAnimationFrame(this._loop);
    }

    newGame() {
        this.pool = new EnemyPool();
        this.enemies = this.pool;
        this.projectiles = { player: this.pool.playerProjectiles, enemy: this.pool.enemyProjectiles };
        this.pickups = this.pool.pickups;

        this.stats = { time: 0, kills: 0, coins: 0, damageDealt: 0, level: 1, xp: 0, xpToNextLevel: XP_REQUIRED_BASE };
        this.camera.x = this.worldWidth / 2 - CANVAS_WIDTH / 2;
        this.camera.y = this.worldHeight / 2 - CANVAS_HEIGHT / 2;

        const ch = this._selectedCharacter;
        this.player = new Player(
            this.worldWidth / 2, this.worldHeight / 2,
            { hpBonus: ch.hpBonus, speedBonus: ch.speedBonus, damageBonus: ch.damageBonus, startingWeapon: ch.startingWeapon }
        );
        this._loadPermanentUpgrades();

        this.spawner = new Spawner(this);
        this.collision = new CollisionSystem(this);
        this.upgradeSystem = new UpgradeSystem(this);
        this.upgradeSystem.resetRun();
        this.effects = new EffectsSystem(this);
        this.hud = new HUD(this.renderer);
        this.upgradeChoice = new UpgradeChoice(this.renderer, this.input);
        this.notifications = new NotificationSystem(this.renderer);

        this.upgradeChoice.onSelect = (idx) => this._handleUpgradeSelect(idx);

        this._pendingAdMidgame = false;
        this._reviveUsed = false;
        this._coinsDoubled = false;
        this._upgradeChoices = [];

        SDK.game.gameplayStart();
        this.changeState(GAME_STATES.PLAYING);
    }

    changeState(newState) {
        this.state = newState;
        if (newState === GAME_STATES.PLAYING) {
            this._lastTimestamp = performance.now();
        }
    }

    _loop(timestamp) {
        if (!this._rafId) return;
        let dt = (timestamp - this._lastTimestamp) / 1000;
        this._lastTimestamp = timestamp;
        if (dt > 0.033) dt = 0.033;
        if (dt <= 0) { this._rafId = requestAnimationFrame(this._loop); return; }
        this.deltaTime = dt;
        try { this._update(dt); } catch (e) { console.error('update error', e); }
        try { this._render(); } catch (e) { console.error('render error', e); }
        this.input.update();
        this._rafId = requestAnimationFrame(this._loop);
    }

    _update(dt) {
        if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.LOADING) {
            if (this._shopOpen && this.shopUI) {
                this.shopUI.update(dt, this._coinBalance, this._getPurchasedLevels());
            } else if (this.menu) {
                this.menu.update(dt);
            }
            return;
        }

        if (this.state === GAME_STATES.PAUSED) {
            const action = this.pauseMenu.update();
            if (action === 'resume') this.changeState(GAME_STATES.PLAYING);
            else if (action === 'menu') { this._savePersisted(); this.changeState(GAME_STATES.MENU); }
            return;
        }

        if (this.state === GAME_STATES.UPGRADING) {
            this.upgradeChoice.update(dt);
            return;
        }

        if (this.state === GAME_STATES.DEAD) {
            this.gameOverScreen.update(dt, {
                timeSurvived: this.stats.time,
                wave: this.spawner ? this.spawner.getWave() : 0,
                kills: this.stats.kills,
                damageDealt: this.stats.damageDealt,
                coinsEarned: this.stats.coins,
            });
            return;
        }

        if (this.input.isPressed('Escape')) {
            this.changeState(GAME_STATES.PAUSED);
            return;
        }

        this.stats.time += dt;

        const activeEnemies = this.pool.getActiveEnemies();
        const worldSize = { width: this.worldWidth, height: this.worldHeight };
        this.player.update(dt, this.input, worldSize, activeEnemies);

        if (!this.player.isAlive()) {
            this._onPlayerDeath();
            return;
        }

        this._updateWeapons(dt);

        this.pool.updateAll(dt, this.player, worldSize);
        this.spawner.update(dt);
        this._syncProjectilesAndPickups();

        const result = this.collision.update(dt);
        this.stats.kills += (result && result.kills) || 0;
        this.stats.damageDealt += (result && result.damageDealt) || 0;

        this.pool.removeDead();

        this._checkXPAndLevelUp();
        this._updateCamera(dt);
        this.effects.update(dt);
        this.notifications.update(dt);
    }

    _updateWeapons(dt) {
        for (const weapon of this.player.weapons) {
            if (weapon.currentCooldown > 0) continue;
            const def = WEAPONS[weapon.id];
            if (!def) continue;

            const px = this.player.x;
            const py = this.player.y;
            const aim = this.player.getAimAngle();
            const dmg = Math.floor(weapon.damage * this.player.damageMultiplier);
            const pierce = weapon.pierce || 0;

            if (def.type === 'projectile') {
                for (let i = 0; i < weapon.projectileCount; i++) {
                    const spread = (i - (weapon.projectileCount - 1) / 2) * 0.2;
                    const angle = aim + spread;
                    const vx = Math.cos(angle) * weapon.speed;
                    const vy = Math.sin(angle) * weapon.speed;
                    this.pool.spawnPlayerProjectile(px, py, vx, vy, dmg, 3 + weapon.size, def.color, pierce, weapon.duration);
                }
                weapon.currentCooldown = weapon.cooldown;
            } else if (def.type === 'aura') {
                const radius = (def.radius || 80) + ((weapon.level - 1) * (def.radiusPerLevel || 10));
                const activeEnemies = this.pool.getActiveEnemies();
                for (const enemy of activeEnemies) {
                    const dx = enemy.x - px;
                    const dy = enemy.y - py;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius + enemy.radius) {
                        const killed = enemy.takeDamage(dmg);
                        this.stats.damageDealt += dmg;
                        if (killed) { this.stats.kills++; this._spawnPickupsForEnemy(enemy); }
                    }
                }
                weapon.currentCooldown = weapon.cooldown;
            } else if (def.type === 'chain') {
                const activeEnemies = this.pool.getActiveEnemies();
                let source = { x: px, y: py };
                const chained = new Set();
                const chainCount = (def.chainCount || 3) + Math.floor((weapon.level - 1) / 3);
                const chainRange = (def.chainRange || 150);
                for (let c = 0; c < chainCount; c++) {
                    let nearest = null, nearestDist = chainRange;
                    for (const enemy of activeEnemies) {
                        if (chained.has(enemy)) continue;
                        const dx = enemy.x - source.x, dy = enemy.y - source.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < nearestDist) { nearestDist = dist; nearest = enemy; }
                    }
                    if (!nearest) break;
                    chained.add(nearest);
                    this.effects.addParticles(nearest.x, nearest.y, def.color, 5, 60, 0.3);
                    const killed = nearest.takeDamage(dmg);
                    this.stats.damageDealt += dmg;
                    if (killed) { this.stats.kills++; this._spawnPickupsForEnemy(nearest); }
                    source = { x: nearest.x, y: nearest.y };
                }
                weapon.currentCooldown = weapon.cooldown;
            } else if (def.type === 'orbit') {
                for (let i = 0; i < weapon.projectileCount; i++) {
                    const orbitSpeed = (def.orbitSpeed || 3) + (weapon.level - 1) * (def.orbitSpeedPerLevel || 0.3);
                    const orbitRadius = (def.orbitRadius || 90);
                    const angle = this.stats.time * orbitSpeed + (i * Math.PI * 2 / weapon.projectileCount);
                    const ox = px + Math.cos(angle) * orbitRadius;
                    const oy = py + Math.sin(angle) * orbitRadius;
                    this.pool.spawnPlayerProjectile(ox, oy, 0, 0, dmg, 4 + weapon.size, def.color, pierce, 0.05);
                }
                weapon.currentCooldown = 0.05;
            } else if (def.type === 'nova') {
                const radius = (def.radius || 60) + (weapon.level - 1) * (def.radiusPerLevel || 8);
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    const vx = Math.cos(angle) * 60;
                    const vy = Math.sin(angle) * 60;
                    this.pool.spawnPlayerProjectile(px, py, vx, vy, dmg * 0.4, 2 + weapon.size, def.color, pierce, 0.4);
                }
                weapon.currentCooldown = weapon.cooldown;
            } else {
                weapon.currentCooldown = weapon.cooldown;
            }
        }
    }

    _spawnPickupsForEnemy(enemy) {
        const xpVal = enemy.getXPValue();
        const coinVal = enemy.getCoinValue();
        this.player.addXP(xpVal, this.player.xpGainMultiplier);
        this.stats.coins += coinVal;
        this.pool.spawnPickup(enemy.x, enemy.y, 'xp');
        if (Math.random() < 0.3) this.pool.spawnPickup(enemy.x, enemy.y, 'coin');
        this.effects.deathEffect(enemy.x, enemy.y, enemy.color || COLORS.enemy_basic);
        if (enemy.typeKey === 'boss') this.effects.bossDeathEffect(enemy.x, enemy.y);
    }

    _syncProjectilesAndPickups() {
        this.projectiles.player = this.pool.playerProjectiles;
        this.projectiles.enemy = this.pool.enemyProjectiles;
        this.pickups = this.pool.pickups;
    }

    _checkXPAndLevelUp() {
        const currentXP = this.player.getXP();
        if (currentXP >= this.stats.xpToNextLevel) {
            this.stats.level++;
            this.player.level++;
            this.player._xp = currentXP - this.stats.xpToNextLevel;
            this.stats.xpToNextLevel = Math.floor(XP_REQUIRED_BASE * Math.pow(XP_REQUIRED_SCALE, this.stats.level - 1));
            this.stats.xp = this.player._xp;

            this._upgradeChoices = this.upgradeSystem.getRandomChoices(3, this.player.weapons, this.player.getStats());
            if (this._upgradeChoices.length > 0) {
                this.changeState(GAME_STATES.UPGRADING);
                this.effects.levelUpEffect(this.player.x, this.player.y);
            }
        }
    }

    _handleUpgradeSelect(idx) {
        if (idx >= 0 && idx < this._upgradeChoices.length) {
            this.upgradeSystem.applyUpgrade(this._upgradeChoices[idx], this.player);
        }
        this.changeState(GAME_STATES.PLAYING);
    }

    _onPlayerDeath() {
        this.changeState(GAME_STATES.DEAD);
        SDK.game.gameplayStop();
        this.effects.deathEffect(this.player.x, this.player.y, COLORS.player);
        this.effects.screenShake(15, 0.5);
        this.effects.damageFlash(0.3);
        this.gameOverScreen.canRevive = !this._reviveUsed;
        this.gameOverScreen.canDoubleCoins = !this._coinsDoubled;

        const coinsEarned = this.stats.coins;
        this._coinBalance += coinsEarned;

        if (this.stats.kills > (this._bestStats.kills || 0)) {
            this._bestStats = { wave: this.spawner.getWave(), kills: this.stats.kills, time: this.stats.time };
        }
        this._savePersisted();

        if (!this._pendingAdMidgame && Math.random() < 0.5) {
            this._pendingAdMidgame = true;
            SDK.ad.requestMidgame().then(() => { this._pendingAdMidgame = false; });
        }
    }

    async _handleRevive() {
        const watched = await SDK.ad.requestRewarded();
        if (watched) {
            this._reviveUsed = true;
            this.player.alive = true;
            this.player.hp = Math.floor(this.player.maxHP * 0.5);
            this.player.invincibilityTimer = 2;
            this.gameOverScreen.canRevive = false;
            this.changeState(GAME_STATES.PLAYING);
            SDK.game.gameplayStart();
        }
    }

    async _handleDoubleCoins() {
        const watched = await SDK.ad.requestRewarded();
        if (watched) {
            this._coinsDoubled = true;
            this._coinBalance += this.stats.coins;
            this.gameOverScreen.canDoubleCoins = false;
            this._savePersisted();
        }
    }

    async _savePersisted() {
        await SDK.data.save('horde_save', {
            coins: this._coinBalance,
            best: this._bestStats,
            characters: this._unlocked || [],
            levels: this._permLevels || {},
        });
    }

    _loadPermanentUpgrades() {
        const levels = (this._persistedData && this._persistedData.levels) || {};
        this._permLevels = levels;
        for (const [type, lvl] of Object.entries(levels)) {
            this.player.applyPermanentUpgrade(type, lvl);
        }
    }

    _getPurchasedLevels() {
        return this._permLevels || {};
    }

    _buyShopItem(id) {
        const item = SHOP_ITEMS.find(i => i.id === id);
        if (!item) return;
        const currentLvl = (this._permLevels || {})[id] || 0;
        const cost = Math.floor(item.baseCost * Math.pow(item.costScale, currentLvl));
        if (currentLvl >= item.maxLevel || this._coinBalance < cost) return;
        this._coinBalance -= cost;
        this._permLevels[id] = currentLvl + 1;
        if (this.player) this.player.applyPermanentUpgrade(id, currentLvl + 1);
        this._savePersisted();
    }

    _updateCamera(dt) {
        if (!this.player) return;
        const tx = this.player.x - CANVAS_WIDTH / 2;
        const ty = this.player.y - CANVAS_HEIGHT / 2;
        this.camera.x += (tx - this.camera.x) * 0.1;
        this.camera.y += (ty - this.camera.y) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - CANVAS_WIDTH));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - CANVAS_HEIGHT));
    }

    _render() {
        const ctx = this.renderer.ctx;
        const cam = this.camera;
        this.renderer.clear();

        if (this.state === GAME_STATES.MENU || this.state === GAME_STATES.LOADING) {
            const ctx = this.renderer.ctx;
            ctx.fillStyle = COLORS.background;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            if (this._shopOpen && this.shopUI) {
                this.shopUI.render(this._coinBalance, this._getPurchasedLevels());
            } else if (this.menu) {
                this.menu.render(this._coinBalance, this._bestStats);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Loading...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            }
            return;
        }

        if (this.state === GAME_STATES.DEAD) {
            this._renderWorld(ctx, cam);
            this.gameOverScreen.render({
                timeSurvived: this.stats.time,
                wave: this.spawner ? this.spawner.getWave() : 0,
                kills: this.stats.kills,
                damageDealt: this.stats.damageDealt,
                coinsEarned: this.stats.coins,
            });
            return;
        }

        this._renderWorld(ctx, cam);

        if (this.state === GAME_STATES.PAUSED) {
            this.pauseMenu.render();
        }
        if (this.state === GAME_STATES.UPGRADING) {
            this.upgradeChoice.render(this._upgradeChoices);
        }
    }

    _renderWorld(ctx, cam) {
        ctx.save();
        ctx.translate(-cam.x, -cam.y);

        for (const p of this.pool.pickups) {
            if (p && p.isAlive()) this._renderPickup(p);
        }
        for (const e of this.pool.enemies) {
            if (e && e.isAlive()) this._renderEnemy(e);
        }
        for (const p of this.pool.playerProjectiles) {
            if (p && p.isAlive()) this._renderProjectile(p);
        }
        for (const p of this.pool.enemyProjectiles) {
            if (p && p.isAlive()) this._renderProjectile(p);
        }
        if (this.player && this.player.isAlive()) {
            this._renderPlayer();
        }
        this.effects.render(ctx);
        ctx.restore();

        if (this.hud) {
            const waveInfo = {
                current: this.spawner ? this.spawner.getWave() : 0,
                max: MAX_WAVES,
            };
            const hudPlayer = {
                hp: this.player.hp,
                maxHp: this.player.maxHP,
                level: this.player.level,
                xp: this.player.getXP(),
                xpToNext: this.stats.xpToNextLevel,
                weapons: this.player.weapons.map((w) => {
                    const def = WEAPONS[w.id];
                    return { ...w, color: def ? def.color : '#fff' };
                }),
            };
            this.hud.render(hudPlayer, { kills: this.stats.kills, coinsEarned: this.stats.coins }, waveInfo, this.stats.time);
        }
        this.effects.renderUI(ctx);
        this.notifications.render(ctx);
    }

    _renderPlayer() {
        const p = this.player;
        const x = p.x, y = p.y, r = p.radius;
        if (p.invincibilityTimer > 0 && Math.floor(p.invincibilityTimer * 10) % 2 === 0) return;
        const ctx = this.renderer.ctx;
        ctx.save();
        ctx.shadowColor = COLORS.playerGlow;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.player;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = COLORS.playerStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
        const ax = x + Math.cos(p.aimAngle) * (r + 6);
        const ay = y + Math.sin(p.aimAngle) * (r + 6);
        ctx.beginPath();
        ctx.arc(ax, ay, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
    }

    _renderEnemy(e) {
        const ctx = this.renderer.ctx;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.strokeStyle = e.strokeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (e.attackRange) {
            const hpPct = e.hp / e.maxHp;
            const barW = e.radius * 2;
            const barH = 3;
            ctx.fillStyle = '#333';
            ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, barW, barH);
            ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, barW * hpPct, barH);
        }
    }

    _renderProjectile(p) {
        const ctx = this.renderer.ctx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }

    _renderPickup(p) {
        const ctx = this.renderer.ctx;
        const alpha = Math.min(1, p.lifetime / 2);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'xp' ? COLORS.xpGem : COLORS.coin;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    getWorldSize() {
        return { w: this.worldWidth, h: this.worldHeight };
    }

    destroy() {
        if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
        if (this.input) this.input.destroy();
    }
}
