import { SHOP_ITEMS } from '../constants.js';

export function getShopItem(id) {
    return SHOP_ITEMS.find(item => item.id === id);
}

export function calculateCost(item, currentLevel) {
    return Math.floor(item.baseCost * Math.pow(item.costScale, currentLevel));
}

export function canAfford(item, currentLevel, coinBalance) {
    if (currentLevel >= item.maxLevel) return false;
    return coinBalance >= calculateCost(item, currentLevel);
}
