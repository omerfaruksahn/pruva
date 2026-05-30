const db = require('./db');

/**
 * Kritik sistem olaylarını loglar.
 * @param {number} userId - İşlemi yapan kullanıcı
 * @param {string} action - Yapılan eylem (CREATE, ACCEPT, DELETE vb.)
 * @param {string} entityType - Hangi tablo/model etkilendi (listings, offers vb.)
 * @param {number} entityId - Etkilenen kaydın ID'si
 */
const createAuditLog = async (userId, action, entityType, entityId) => {
    try {
        await db.query(
            'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
            [userId, action, entityType, entityId]
        );
        console.log(`[AUDIT LOG] User #${userId} performed ${action} on ${entityType} #${entityId}`);
    } catch (err) {
        // Audit log hatası ana işlemi bozmamalı ama konsola yazılmalı
        console.error('[AUDIT ERROR] Failed to create audit log:', err.message);
    }
};

module.exports = { createAuditLog };
