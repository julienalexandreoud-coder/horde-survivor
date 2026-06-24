let sdk = null;
let initialized = false;
let canShowMidgameAd = true;
let canShowRewardedAd = true;
let adblockDetected = false;

export async function initSDK() {
    try {
        if (typeof window !== 'undefined' && window.CrazyGames && window.CrazyGames.SDK) {
            sdk = window.CrazyGames.SDK;
            await sdk.init();
            initialized = true;
            console.log('CrazyGames SDK initialized');

            try {
                const result = await sdk.ad.hasAdblock();
                adblockDetected = result;
                console.log('Adblock detected:', result);
            } catch (e) {
                console.log('Adblock check failed:', e);
            }
        } else {
            console.log('CrazyGames SDK not available (local dev or non-CG domain)');
        }
    } catch (e) {
        console.log('SDK init failed:', e);
    }
}

export function getSDK() {
    return sdk;
}

export function isSDKAvailable() {
    return initialized && sdk !== null;
}

export function hasAdblock() {
    return adblockDetected;
}

export const SDK = {
    game: {
        gameplayStart() {
            try {
                if (initialized) sdk.game.gameplayStart();
            } catch (e) {}
        },
        gameplayStop() {
            try {
                if (initialized) sdk.game.gameplayStop();
            } catch (e) {}
        },
        happyTime() {
            try {
                if (initialized) sdk.game.happytime();
            } catch (e) {}
        },
        loadingStart() {
            try {
                if (initialized) sdk.game.loadingStart();
            } catch (e) {}
        },
        loadingStop() {
            try {
                if (initialized) sdk.game.loadingStop();
            } catch (e) {}
        },
        getSettings() {
            try {
                return sdk?.game?.settings || {};
            } catch (e) {
                return {};
            }
        },
        addSettingsChangeListener(fn) {
            try {
                if (initialized) sdk.game.addSettingsChangeListener(fn);
            } catch (e) {}
        },
    },

    ad: {
        async requestMidgame() {
            if (!initialized || !canShowMidgameAd) return false;
            canShowMidgameAd = false;
            setTimeout(() => { canShowMidgameAd = true; }, 90000);

            return new Promise((resolve) => {
                try {
                    sdk.ad.requestAd('midgame', {
                        adFinished: () => resolve(true),
                        adError: (e) => {
                            console.log('Midgame ad error:', e);
                            resolve(false);
                        },
                        adStarted: () => {},
                    });
                } catch (e) {
                    resolve(false);
                }
            });
        },

        async requestRewarded() {
            if (!initialized || !canShowRewardedAd) return false;
            canShowRewardedAd = false;
            setTimeout(() => { canShowRewardedAd = true; }, 30000);

            return new Promise((resolve) => {
                try {
                    sdk.ad.requestAd('rewarded', {
                        adFinished: () => resolve(true),
                        adError: (e) => {
                            console.log('Rewarded ad error:', e);
                            resolve(false);
                        },
                        adStarted: () => {},
                    });
                } catch (e) {
                    resolve(false);
                }
            });
        },
    },

    banner: {
        async show(id, width, height) {
            try {
                if (initialized) {
                    await sdk.banner.requestBanner({ id, width, height });
                }
            } catch (e) {}
        },
        async hide(id) {
            try {
                if (initialized) {
                    await sdk.banner.clearBanner(id);
                }
            } catch (e) {}
        },
    },

    data: {
        async save(key, value) {
            try {
                if (initialized) {
                    await sdk.data.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            } catch (e) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        },
        async load(key) {
            try {
                if (initialized) {
                    const data = await sdk.data.getItem(key);
                    return data ? JSON.parse(data) : null;
                }
            } catch (e) {}
            const local = localStorage.getItem(key);
            return local ? JSON.parse(local) : null;
        },
    },

    user: {
        async getUser() {
            try {
                if (initialized) {
                    return await sdk.user.getUser();
                }
            } catch (e) {}
            return null;
        },
        getSystemInfo() {
            try {
                if (initialized) {
                    return sdk.user.systemInfo || null;
                }
            } catch (e) {}
            return null;
        },
    },
};
