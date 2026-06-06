// ─── PRUVA Admin Panel — Kurs Yönetimi ───
import { utils, paginate, PAGE_SIZE } from './utils.js';

export function renderCourses(state) {
    const search = utils.norm(state.filters?.search || '');

    let courses = (state.courses || []).filter(c => {
        if (!search) return true;
        return utils.norm(c.title || '').includes(search)
            || utils.norm(c.description || '').includes(search);
    });

    // Sort by date descending
    courses.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

    const pg = paginate(courses, state.filters?.page || 1);

    let html = `
    <div class="card">
        <div class="card-header">
            <h3><i data-lucide="graduation-cap"></i> Kurs Yönetimi</h3>
            <div class="header-actions">
                <div class="search-box">
                    <i data-lucide="search"></i>
                    <input type="text" placeholder="Kurs ara..." 
                           value="${utils.esc(state.filters?.search || '')}"
                           oninput="window.adminActions.setFilter('search', this.value)" />
                </div>
                <button class="btn btn-primary" onclick="window.adminActions.createCourse()">
                    <i data-lucide="plus"></i> Yeni Kurs Oluştur
                </button>
            </div>
        </div>
        <div class="card-body">`;

    if (pg.items.length === 0) {
        html += utils.emptyState('graduation-cap', 'Henüz kurs oluşturulmamış');
    } else {
        html += `
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Başlık</th>
                            <th>Açıklama</th>
                            <th>Ders Sayısı</th>
                            <th>Tarih</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>`;

        for (const c of pg.items) {
            const courseId = c.id || c.courseId;
            const desc = c.description || '';
            const truncDesc = desc.length > 80
                ? utils.esc(desc.substring(0, 80)) + '…'
                : utils.esc(desc);
            const lessonCount = c.lessonCount || c.lessons?.length || 0;
            const date = utils.formatDate(c.createdAt || c.created_at);

            html += `
                        <tr>
                            <td><strong>${utils.esc(c.title || '—')}</strong></td>
                            <td class="text-muted">${truncDesc || '—'}</td>
                            <td>${utils.formatNumber(lessonCount)}</td>
                            <td>${date}</td>
                            <td class="action-cell">
                                <button class="btn btn-outline btn-sm" onclick="window.adminActions.editCourse('${utils.esc(courseId)}')">
                                    <i data-lucide="edit-3"></i> Düzenle
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="window.adminActions.deleteCourse('${utils.esc(courseId)}')">
                                    <i data-lucide="trash-2"></i> Sil
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
