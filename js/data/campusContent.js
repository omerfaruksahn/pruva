// js/data/campusContent.js

window.campusContent = {
    categories: [
        { id: 'all', name: 'Tümü', icon: 'grid' },
        { id: 'books', name: 'Kitaplar', icon: 'book' },
        { id: 'articles', name: 'Makaleler & Vaka Analizleri', icon: 'file-text' },
        { id: 'videos', name: 'Video Eğitimler', icon: 'play-circle' },
        { id: 'consulting', name: 'Birebir Danışmanlık', icon: 'user' }
    ],
    instructors: [
        {
            id: 'inst-1',
            name: 'Kaptan Ömer Yılmaz',
            title: 'Uzakyol Kaptanı & Lojistik Uzmanı',
            avatar: 'https://i.pravatar.cc/150?u=omer',
            bio: '20 yıllık denizcilik ve konteyner operasyonları tecrübesiyle sektördeki gençlere rehberlik ediyor.',
            rating: 4.9,
            students: 12500
        },
        {
            id: 'inst-2',
            name: 'Dr. Selen Can',
            title: 'Gümrük Müşaviri',
            avatar: 'https://i.pravatar.cc/150?u=selen',
            bio: 'Dış ticaret mevzuatı ve gümrük operasyonları konusunda sayısız yayını bulunmaktadır.',
            rating: 4.8,
            students: 8400
        },
        {
            id: 'inst-3',
            name: 'Murat Karabulut',
            title: 'Tedarik Zinciri Yöneticisi',
            avatar: 'https://i.pravatar.cc/150?u=murat',
            bio: 'Global tedarik zinciri stratejileri ve depo yönetimi alanında uzman eğitmen.',
            rating: 4.7,
            students: 5200
        }
    ],
    products: [
        {
            id: 'prod-1',
            type: 'books',
            title: 'Uluslararası Nakliye ve Navlun Yönetimi (E-Kitap)',
            instructorId: 'inst-1',
            price: '₺249',
            priceRaw: 249,
            rating: '4.9 (3.2K)',
            cover: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&q=80&w=400',
            description: 'Lojistik sektörüne yeni adım atanlar ve bilgisini tazelemek isteyenler için başucu rehberi. FCL, LCL operasyonlarından konşimento türlerine kadar her şey bu kitapta.',
            tags: ['Lojistik', 'Navlun', 'Denizcilik'],
            badge: 'En Çok Satan',
            color: '#0ea5e9'
        },
        {
            id: 'prod-2',
            type: 'articles',
            title: '2026 Gümrük Mevzuatı Değişiklikleri ve Etkileri',
            instructorId: 'inst-2',
            price: 'Ücretsiz',
            priceRaw: 0,
            rating: '4.8 (1.5K)',
            cover: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400',
            description: 'Bu yıl yürürlüğe giren yeni gümrük mevzuatlarının ithalat ve ihracat operasyonlarına etkilerini detaylı örneklerle inceleyen kapsamlı vaka analizi.',
            tags: ['Gümrük', 'Mevzuat'],
            badge: 'Yeni Makale',
            color: '#10b981'
        },
        {
            id: 'prod-3',
            type: 'videos',
            title: 'A\'dan Z\'ye Dijital Tedarik Zinciri Masterclass',
            instructorId: 'inst-3',
            price: '₺1,499',
            priceRaw: 1499,
            rating: '4.9 (2.1K)',
            cover: 'https://images.unsplash.com/photo-1586528116311-ad8c73875084?auto=format&fit=crop&q=80&w=400',
            description: '18 saatlik video eğitim ile dijital lojistik teknolojileri, blockchain, IoT ve depo otomasyon sistemlerini öğrenin.',
            tags: ['Tedarik Zinciri', 'Teknoloji'],
            badge: 'Popüler Kurs',
            color: '#8b5cf6'
        },
        {
            id: 'prod-4',
            type: 'books',
            title: 'Konteyner Taşımacılığında Risk Yönetimi',
            instructorId: 'inst-1',
            price: '₺199',
            priceRaw: 199,
            rating: '4.7 (950)',
            cover: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80&w=400',
            description: 'Hasar süreçleri, sigorta türleri ve demuraj/detansiyon masraflarından kaçınma taktikleri.',
            tags: ['Risk Yönetimi', 'Konteyner'],
            badge: '',
            color: '#f59e0b'
        }
    ]
};
