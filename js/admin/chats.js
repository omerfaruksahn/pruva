// ─── PRUVA Admin Panel — Sohbet Yönetimi ───
import { utils, paginate, PAGE_SIZE } from './utils.js';

export function renderChats(state) {
    const search = utils.norm(state.filters?.search || '');

    // Filter chats by participant name/email
    let chats = (state.chats || []).filter(c => {
        if (!search) return true;
        const participants = (c.participants || []).join(' ');
        return utils.norm(participants).includes(search);
    });

    // Sort by date descending
    chats.sort((a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0));

    const pg = paginate(chats, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="message-circle"></i> Sohbet Moderasyonu</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Katılımcı ara..." 
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('message-circle', 'Aktif sohbet bulunmuyor');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Katılımcılar</th>
                            <th>Son Mesaj</th>
                            <th>Mesaj Sayısı</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const chat of pg.items) {
            const participants = (chat.participants || []).map(p => utils.esc(p)).join(', ');
            const lastMsg = chat.lastMessage
                ? (chat.lastMessage.length > 60 ? utils.esc(chat.lastMessage.substring(0, 60)) + '…' : utils.esc(chat.lastMessage))
                : '<span class="text-muted">—</span>';
            const msgCount = chat.messageCount || chat.messages?.length || 0;
            const date = utils.timeAgo(chat.lastMessageAt || chat.createdAt);
            const chatId = chat.id || chat.chatId;

            html += `
                        <tr>
                            <td>
                                <div class="user-cell">
                                    <i data-lucide="users"></i>
                                    <span>${participants || '—'}</span>
                                </div>
                            </td>
                            <td class="text-muted">${lastMsg}</td>
                            <td><strong>${utils.formatNumber(msgCount)}</strong></td>
                            <td>${date}</td>
                            <td>
                                <button class="btn btn-outline btn-sm" onclick="window.adminActions.viewChatMessages('${utils.esc(chatId)}')">
                                    <i data-lucide="eye"></i> Mesajları Gör
                                </button>
                            </td>
                        </tr>`;
        }

        html += `
                    </tbody>
                </table>
            </div>`;

        html += utils.pagination(pg.currentPage, pg.totalPages, 'window.adminActions.setPage');
    }

    html += `
        </div>
    </div>`;

    return html;
}
