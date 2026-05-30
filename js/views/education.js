window.educationView = (state) => {
    const { chapters } = window.educationContent;
    
    if (state.eduViewMode === 'portal') {
        return renderPortal(state, chapters);
    } else {
        return renderPlayer(state, chapters);
    }
};

const renderPortal = (state, chapters) => {
    const categories = [
        { id: 'all', name: 'Tümü' },
        { id: 'logistics', name: 'Lojistik' },
        { id: 'maritime', name: 'Denizcilik' },
        { id: 'customs', name: 'Gümrük' },
        { id: 'trade', name: 'Dış Ticaret' },
        { id: 'tech', name: 'Lojistik Tech' }
    ];

    const mainProgress = Math.round((state.eduReadModules.length / chapters.length) * 100);
    const displayCourses = [
        {
            id: 'edu-1',
            title: 'Uluslararası Nakliye ve Navlun Yönetimi',
            category: 'Lojistik',
            instructor: 'Kaptan Ömer',
            rating: '4.9 (3.2K)',
            duration: '18 Saat',
            level: 'İleri',
            progress: mainProgress,
            icon: 'anchor',
            color: '#0ea5e9',
            price: 'Aktif'
        },
        {
            id: 'edu-2',
            title: 'Temel Deniz Ticareti ve Liman Operasyonları',
            category: 'Denizcilik',
            instructor: 'Alperen Kaptan',
            rating: '4.8 (1.5K)',
            duration: '12 Saat',
            level: 'Orta',
            progress: 0,
            icon: 'ship',
            color: '#10b981',
            price: 'Yakında'
        },
        {
            id: 'edu-3',
            title: 'Gümrük Mevzuatı ve Dış Ticaret',
            category: 'Gümrük',
            instructor: 'Mustafa Yılmaz (Gümrük Müşaviri)',
            rating: '4.9 (2.1K)',
            duration: '15 Saat',
            level: 'İleri',
            progress: 0,
            icon: 'shield',
            color: '#f59e0b',
            price: 'Yakında'
        },
        {
            id: 'edu-4',
            title: 'Dijital Lojistik Teknolojileri',
            category: 'Lojistik Tech',
            instructor: 'Dr. Selen Can',
            rating: '4.7 (950)',
            duration: '8 Saat',
            level: 'Başlangıç',
            progress: 0,
            icon: 'cpu',
            color: '#8b5cf6',
            price: 'Yakında'
        }
    ];

    const ongoingCourses = [
        { title: 'Gümrük Mevzuatı Temel Eğitimi', progress: 72, icon: 'shield' },
        { title: 'Lojistik 4.0 ve Dijitalleşme', progress: 45, icon: 'cpu' },
        { title: 'Tedarik Zinciri Yönetimi', progress: 60, icon: 'layers' }
    ];

    const upcomingEvents = [
        { day: '24', month: 'MAY', title: 'Navlun Piyasası Analizi', time: '20:00 - 21:30', instructor: 'Murat KARABULUT' },
        { day: '25', month: 'MAY', title: 'Blockchain ve Lojistik', time: '19:00 - 20:30', instructor: 'Melis DURAN' }
    ];

    return `
    <div class="education-container">
        <div class="edu-portal fade-in-up">
            <!-- Main Content Area -->
            <main class="edu-main-content">
                
                <!-- Search Bar -->
                <div class="edu-search-bar">
                    <div class="search-wrapper">
                        <i data-lucide="search"></i>
                        <input type="text" placeholder="Eğitim, rota veya konu ara...">
                        <kbd>⌘ K</kbd>
                    </div>
                </div>

                <!-- Hero Section (Flat Maritime) -->
                <section class="edu-hero flat-maritime">
                    <div class="hero-text">
                        <div class="hero-badge"><i data-lucide="compass"></i> Pruva Akademi</div>
                        <h1>Rotanı <span class="text-gradient">Bilgiyle Çiz.</span></h1>
                        <p>Lojistik ve dış ticaret dünyasında uzmanlaşmak için en güncel eğitimler. Pruva ile kariyerinde yelkenleri tazele.</p>
                        <div class="hero-actions">
                            <button class="hero-btn primary" onclick="window.utils.setEduViewMode('player')">
                                Eğitime Başla <i data-lucide="play-circle"></i>
                            </button>
                            <button class="hero-btn secondary">
                                Müfredatı İncele
                            </button>
                        </div>
                    </div>
                    <div class="hero-visual">
                        <!-- Minimal Vector-style Compass/Ship element -->
                        <div class="maritime-abstract">
                            <div class="wave wave-1"></div>
                            <div class="wave wave-2"></div>
                            <i data-lucide="navigation" class="floating-icon"></i>
                        </div>
                    </div>
                </section>

                <!-- Stats Row -->
                <section class="edu-stats-flat">
                    <div class="stat-box">
                        <div class="stat-val">300+</div>
                        <div class="stat-lbl">Modül</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-box">
                        <div class="stat-val">25K+</div>
                        <div class="stat-lbl">Kaptan</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-box">
                        <div class="stat-val">150+</div>
                        <div class="stat-lbl">Eğitmen</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-box">
                        <div class="stat-val">50+</div>
                        <div class="stat-lbl">Sertifika</div>
                    </div>
                </section>

                <!-- Category Filters -->
                <section class="edu-filters">
                    ${categories.map(cat => `
                        <button class="filter-pill ${state.eduCategory === cat.id ? 'active' : ''}" onclick="window.utils.setEduCategory('${cat.id}')">
                            ${cat.name}
                        </button>
                    `).join('')}
                </section>

                <!-- Popular Courses -->
                <section class="edu-popular">
                    <div class="section-header">
                        <h2>Popüler Eğitimler</h2>
                        <span class="view-all">Tümünü Keşfet <i data-lucide="chevron-right"></i></span>
                    </div>
                    <div class="course-grid-flat">
                        ${displayCourses.map(course => `
                            <div class="course-card-flat" onclick="window.utils.setEduViewMode('player')">
                                <div class="card-icon-box" style="background: ${course.color}15; color: ${course.color};">
                                    <i data-lucide="${course.icon}"></i>
                                </div>
                                <div class="card-body">
                                    <div class="card-top">
                                        <span class="card-cat">${course.category}</span>
                                        <div class="card-rating"><i data-lucide="star"></i> ${course.rating}</div>
                                    </div>
                                    <h3 class="card-title">${course.title}</h3>
                                    <div class="card-instructor">
                                        <div class="mini-avatar"></div>
                                        <span>${course.instructor}</span>
                                    </div>
                                    <div class="card-progress-flat">
                                        <div class="prog-label">İlerleme <span>%${course.progress}</span></div>
                                        <div class="prog-track"><div class="prog-fill" style="width: ${course.progress}%; background: ${course.color};"></div></div>
                                    </div>
                                    <div class="card-footer-flat">
                                        <span><i data-lucide="lock"></i> Kilidi Aç</span>
                                        <span class="card-price" style="margin-left: auto; color: white; font-weight: 800; font-size: 1rem;">${course.price}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <!-- Ongoing Courses -->
                <section class="edu-ongoing">
                    <div class="section-header">
                        <h2>Devam Eden Yolculuklar</h2>
                    </div>
                    <div class="ongoing-grid-flat">
                        ${ongoingCourses.map(course => `
                            <div class="ongoing-item-flat" onclick="window.utils.setEduViewMode('player')">
                                <div class="oi-icon"><i data-lucide="${course.icon}"></i></div>
                                <div class="oi-info">
                                    <h4>${course.title}</h4>
                                    <div class="oi-progress">
                                        <div class="oi-track"><div class="oi-fill" style="width: ${course.progress}%"></div></div>
                                        <span>%${course.progress}</span>
                                    </div>
                                </div>
                                <button class="oi-btn"><i data-lucide="play"></i></button>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </main>

            <!-- Sidebar -->
            <aside class="edu-sidebar-flat">
                
                <!-- Live Simulator Console -->
                <div id="academy-live-simulator">
                    ${window.academySimulator.render()}
                </div>

                <!-- Performance -->
                <div class="sidebar-widget">
                    <h3>Genel Performans</h3>
                    <div class="perf-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" class="bg"></circle>
                            <circle cx="50" cy="50" r="45" class="fg" style="stroke-dasharray: 283; stroke-dashoffset: ${283 - (283 * 0.68)};"></circle>
                        </svg>
                        <div class="perf-val">68<span>%</span></div>
                    </div>
                    <div class="perf-stats">
                        <div class="ps-item"><span>Tamamlanan</span><strong>23</strong></div>
                        <div class="ps-item"><span>Devam Eden</span><strong>7</strong></div>
                    </div>
                </div>

                <!-- Upcoming Events -->
                <div class="sidebar-widget">
                    <div class="sw-header">
                        <h3>Canlı Oturumlar</h3>
                        <i data-lucide="calendar"></i>
                    </div>
                    <div class="event-list-flat">
                        ${upcomingEvents.map(event => `
                            <div class="event-card-flat">
                                <div class="ec-date"><strong>${event.day}</strong><span>${event.month}</span></div>
                                <div class="ec-body">
                                    <h4>${event.title}</h4>
                                    <p>${event.time}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- CTA -->
                <div class="sidebar-widget cta-widget">
                    <div class="cta-icon"><i data-lucide="award"></i></div>
                    <h4>Sertifikalarını Al</h4>
                    <p>Eğitimlerini tamamla, profesyonel sertifikanı hemen indir.</p>
                    <button class="cta-btn">Görüntüle</button>
                </div>

            </aside>
        </div>
    </div>
    `;
};

const renderPlayer = (state, chapters) => {
    const currentIndex = state.currentEduModuleIndex || 0;
    const currentChapter = chapters[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === chapters.length - 1;

    return `
    <div class="education-container player-flat">
        <header class="player-header-flat">
            <div class="ph-left">
                <button class="back-btn" onclick="window.utils.setEduViewMode('portal')">
                    <i data-lucide="chevron-left"></i> <span>Portala Dön</span>
                </button>
                <div class="ph-divider"></div>
                <div class="ph-title">
                    <span>Müfredat</span> / <strong>${currentChapter.title.split('. ')[1] || currentChapter.title}</strong>
                </div>
            </div>
            <div class="ph-right">
                <div class="ph-progress">
                    <div class="ph-track"><div class="ph-fill" style="width: ${((state.eduReadModules.length / chapters.length) * 100)}%"></div></div>
                    <span>%${Math.round((state.eduReadModules.length / chapters.length) * 100)}</span>
                </div>
            </div>
        </header>

        <div class="player-body-flat">
            <aside class="player-nav-flat">
                <div class="nav-scroll">
                    ${chapters.map((ch, idx) => `
                        <div class="nav-item-flat ${idx === currentIndex ? 'active' : ''} ${state.eduReadModules.includes(ch.id) ? 'done' : ''}" onclick="window.utils.setEduModule(${idx})">
                            <div class="nav-num">${state.eduReadModules.includes(ch.id) ? '<i data-lucide="check"></i>' : (idx + 1)}</div>
                            <div class="nav-txt">${ch.title.split('. ')[1] || ch.title}</div>
                        </div>
                    `).join('')}
                </div>
            </aside>

            <main class="player-main-flat">
                <div class="module-wrapper-flat fade-in-up">
                    <div class="mw-header">
                        <div class="mw-meta">
                            <span class="mw-badge">${currentChapter.badge}</span>
                            <span class="mw-time"><i data-lucide="clock"></i> ${currentChapter.readTime}</span>
                        </div>
                        <h1>${currentChapter.title.split('. ')[1] || currentChapter.title}</h1>
                    </div>

                    <div class="mw-content">
                        ${currentChapter.sections.map(sec => `
                            <div class="mw-section">
                                ${sec.title ? `<h2>${sec.title}</h2>` : ''}
                                <p>${sec.content}</p>
                                
                                ${sec.highlights ? `
                                    <ul class="mw-highlights">
                                        ${sec.highlights.map(h => `
                                            <li><i data-lucide="check-circle-2"></i> ${h}</li>
                                        `).join('')}
                                    </ul>
                                ` : ''}

                                ${sec.glossary ? `
                                    <div class="mw-glossary">
                                        ${sec.glossary.map(item => `
                                            <div class="mg-item">
                                                <strong>${item.term}</strong>
                                                <span>${item.desc}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>

                    <footer class="mw-footer">
                        <button class="nav-btn-flat" ${isFirst ? 'disabled' : ''} onclick="window.utils.setEduModule(${currentIndex - 1})">
                            <i data-lucide="arrow-left"></i> Önceki
                        </button>
                        
                        <div class="mw-status">
                            ${state.eduReadModules.includes(currentChapter.id) ? `
                                <span class="status-done"><i data-lucide="check-circle"></i> Tamamlandı</span>
                            ` : `
                                <button class="complete-btn-flat" onclick="window.utils.markEduModuleRead('${currentChapter.id}')"><span>Tamamlandı Olarak İşaretle</span></button>
                            `}
                        </div>

                        <button class="nav-btn-flat primary" ${isLast ? 'disabled' : ''} onclick="window.utils.setEduModule(${currentIndex + 1})">
                            Sonraki <i data-lucide="arrow-right"></i>
                        </button>
                    </footer>
                </div>
            </main>

            <!-- Desktop Simulator Sidebar -->
            <aside class="player-simulator-sidebar">
                <div id="academy-live-simulator">
                    ${window.academySimulator.render()}
                </div>
            </aside>
        </div>

        <!-- Mobile Floating Terminal Drawer -->
        <button class="mobile-simulator-fab" onclick="window.academySimulator_toggleMobileDrawer(true)">
            <i data-lucide="terminal"></i> <span>Simülatör</span>
        </button>

        <div class="mobile-simulator-sheet-overlay" id="mobile-sim-overlay" onclick="window.academySimulator_toggleMobileDrawer(false)"></div>
        <div class="mobile-simulator-sheet" id="mobile-sim-sheet">
            <div class="sheet-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="terminal" style="color: var(--edu-primary); width: 18px; height: 18px;"></i>
                    <h4 style="margin: 0; font-weight: 800; font-size: 1rem; color: var(--edu-text);">Simülatör Konsolu</h4>
                </div>
                <button class="close-sheet-btn" onclick="window.academySimulator_toggleMobileDrawer(false)">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="sheet-body">
                <div id="academy-live-simulator-mobile"></div>
            </div>
        </div>
    </div>
    `;
};
