export const SUBSCRIPTION_TIERS = {
    free: {
        maxClients: 3,
        maxProjects: 3,
        maxStorageMB: 100,
        price: 0,
    },
    pro: {
        maxClients: 10,
        maxProjects: 20,
        maxStorageMB: 500,
        price: 24,
        priceId: "price_pro_29_eur",
        productId: "prod_ST0YZ6RrYBoYz4",
    },
    enterprise: {
        maxClients: -1, // -1 means unlimited
        maxProjects: -1,
        maxStorageMB: -1,
        price: 49.95,
        priceId: "price_enterprise_49_95_eur",
        productId: "prod_ST0ZoTCQ2uck52",
    },
};
export function calculateStorageUsage(songs) {
    let totalMB = 0;
    songs.forEach((song) => {
        song.versions?.forEach((version) => {
            if (version.fileUrl && version.fileUrl.startsWith("blob:")) {
                // Estimate blob URL file size (this is approximate)
                // In a real app, you'd track actual file sizes
                totalMB += 5; // Assume 5MB per audio file
            }
        });
    });
    return Math.round(totalMB * 100) / 100;
}
export function checkLimits(tier, currentClients, currentProjects, currentStorageMB) {
    const limits = SUBSCRIPTION_TIERS[tier];
    return {
        canAddClient: limits.maxClients === -1 || currentClients < limits.maxClients,
        canAddProject: limits.maxProjects === -1 || currentProjects < limits.maxProjects,
        hasStorageSpace: limits.maxStorageMB === -1 || currentStorageMB < limits.maxStorageMB,
        clientsUsed: currentClients,
        projectsUsed: currentProjects,
        storageUsedMB: currentStorageMB,
        limits,
    };
}
export function formatStorage(mb) {
    if (mb === -1)
        return "Unlimited";
    if (mb >= 1024) {
        return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
}
