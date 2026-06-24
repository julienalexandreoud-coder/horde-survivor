import { UPGRADE_CATEGORIES } from '../constants.js';
import { WEAPONS } from '../data/weapons.js';
import { UPGRADES } from '../data/upgrades.js';

const MAX_WEAPONS = 6;
const MIN_WEAPONS_FOR_NEW = 4;

export class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this._takenUpgrades = new Map();
    }

    resetRun() {
        this._takenUpgrades.clear();
    }

    getWeaponDefinition(id) {
        return WEAPONS[id] || null;
    }

    getUpgradeDefinition(id) {
        return UPGRADES[id] || null;
    }

    getRandomChoices(count, playerWeapons, playerStats) {
        const weapons = playerWeapons || this.game.player.weapons;
        const choices = [];
        const weaponIds = new Set(weapons.map(w => w.id));

        const canTakeNewWeapon = weapons.length < MAX_WEAPONS;
        const hasFewWeapons = weapons.length < MIN_WEAPONS_FOR_NEW;

        const existingWeaponUpgrades = this._getAvailableWeaponUpgrades(weapons);
        const statUpgrades = this._getAvailableStatUpgrades();
        const newWeapons = this._getAvailableNewWeapons(weaponIds);

        while (choices.length < count) {
            let pool = [];
            let roll = Math.random();

            if (hasFewWeapons && newWeapons.length > 0 && roll < 0.6) {
                pool = newWeapons.map(w => ({ ...w, choiceType: UPGRADE_CATEGORIES.NEW_WEAPON }));
            } else {
                pool = [
                    ...existingWeaponUpgrades.map(u => ({ ...u, choiceType: UPGRADE_CATEGORIES.WEAPON_UPGRADE })),
                    ...statUpgrades.map(u => ({ ...u, choiceType: UPGRADE_CATEGORIES.STAT })),
                ];
                if (newWeapons.length > 0) {
                    pool.push(...newWeapons.map(w => ({ ...w, choiceType: UPGRADE_CATEGORIES.NEW_WEAPON })));
                }
            }

            if (pool.length === 0) break;

            const choiceIds = new Set(choices.map(c => c.id));
            const filtered = pool.filter(p => !choiceIds.has(p.id));

            if (filtered.length === 0) break;

            const pick = filtered[Math.floor(Math.random() * filtered.length)];
            choices.push(pick);
        }

        return choices;
    }

    _getAvailableNewWeapons(currentWeaponIds) {
        const result = [];
        for (const key of Object.keys(WEAPONS)) {
            const weapon = WEAPONS[key];
            if (currentWeaponIds.has(weapon.id)) continue;
            if (this._countTaken(weapon.id) >= weapon.maxLevel) continue;
            result.push({
                id: weapon.id,
                name: weapon.name,
                description: weapon.description,
                category: UPGRADE_CATEGORIES.NEW_WEAPON,
                weaponId: weapon.id,
                weaponName: weapon.name,
                weaponColor: weapon.color || '#fff',
                currentLevel: 0,
                nextLevel: 1,
            });
        }
        return result;
    }

    _getAvailableWeaponUpgrades(weapons) {
        const result = [];
        for (const weapon of weapons) {
            const def = WEAPONS[weapon.id];
            if (!def) continue;
            const nextLevel = (weapon.level || 1) + 1;
            if (nextLevel > def.maxLevel) continue;
            const upgradeDef = UPGRADES[weapon.id];
            if (this._countTaken(weapon.id) >= def.maxLevel) continue;
            result.push({
                id: weapon.id,
                name: (upgradeDef ? upgradeDef.name : def.name) + ' Lv' + nextLevel,
                description: (upgradeDef ? upgradeDef.description : 'Upgrade ' + def.name),
                category: UPGRADE_CATEGORIES.WEAPON_UPGRADE,
                weaponId: weapon.id,
                weaponName: def.name,
                weaponColor: def.color || '#fff',
                currentLevel: weapon.level || 1,
                nextLevel: nextLevel,
            });
        }
        return result;
    }

    _getAvailableStatUpgrades() {
        const result = [];
        for (const key of Object.keys(UPGRADES)) {
            const upgrade = UPGRADES[key];
            if (upgrade.category !== UPGRADE_CATEGORIES.STAT) continue;
            const countTaken = this._countTaken(upgrade.id);
            if (countTaken >= upgrade.maxLevel) continue;
            result.push({
                id: upgrade.id,
                name: upgrade.name,
                description: upgrade.description,
                category: UPGRADE_CATEGORIES.STAT,
                weaponId: null,
                weaponName: null,
                weaponColor: null,
                currentLevel: countTaken,
                nextLevel: countTaken + 1,
            });
        }
        return result;
    }

    applyUpgrade(choice, player) {
        const p = player || this.game.player;

        if (choice.category === UPGRADE_CATEGORIES.NEW_WEAPON) {
            const weaponDef = WEAPONS[choice.weaponId];
            if (!weaponDef) return false;

            p.addWeapon({
                id: weaponDef.id,
                level: 1,
                damage: weaponDef.baseDamage,
                cooldown: weaponDef.cooldown,
                currentCooldown: 0,
                projectileCount: weaponDef.projectileCount || 1,
                pierce: weaponDef.pierce || 0,
                size: weaponDef.size || 1,
                speed: weaponDef.speed || 300,
                duration: weaponDef.lifetime || 1.5,
            });
            this._incrementTaken(weaponDef.id);
            return true;
        }

        if (choice.category === UPGRADE_CATEGORIES.WEAPON_UPGRADE) {
            p.upgradeWeapon(choice.weaponId);
            this._incrementTaken(choice.weaponId);
            return true;
        }

        if (choice.category === UPGRADE_CATEGORIES.STAT) {
            const upgradeDef = UPGRADES[choice.id];
            const countTaken = this._countTaken(choice.id);
            const nextLevel = countTaken + 1;
            p.applyPermanentUpgrade(upgradeDef ? upgradeDef.statTarget : choice.id, nextLevel);
            this._incrementTaken(choice.id);
            return true;
        }

        return false;
    }

    _incrementTaken(id) {
        const current = this._takenUpgrades.get(id) || 0;
        this._takenUpgrades.set(id, current + 1);
    }

    _countTaken(id) {
        return this._takenUpgrades.get(id) || 0;
    }
}
