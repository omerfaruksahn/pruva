import { FirestoreService } from '../services/firestoreService.js';

export const seedPruvaData = async () => {
    console.log('[SEED] Starting Firestore seeding...');

    // 1. Seed Courses
    const courses = [
        {
            title: 'Uluslararası Nakliye ve Navlun Yönetimi',
            category: 'Lojistik',
            instructor: 'Kaptan Ömer',
            rating: 4.9,
            reviewCount: 3200,
            duration: '18 Saat',
            level: 'İleri',
            icon: 'anchor',
            color: '#0ea5e9',
            price: 20.00,
            isPublished: true,
            description: 'Lojistik dünyasının temellerinden ileri seviye navlun yönetimine kadar kapsamlı bir rehber.'
        },
        {
            title: 'Konteyner Taşımacılığı ve Operasyon',
            category: 'Denizcilik',
            instructor: 'Deniz ERSOY',
            rating: 4.8,
            reviewCount: 1800,
            duration: '12 Saat',
            level: 'Başlangıç',
            icon: 'ship',
            color: '#6366f1',
            price: 20.00,
            isPublished: true,
            description: 'Deniz taşımacılığında konteyner süreçleri, liman operasyonları ve dokümantasyon.'
        },
        {
            title: 'Dış Ticarette Teslim Şekilleri (Incoterms 2020)',
            category: 'Gümrük',
            instructor: 'Serkan DEMİR',
            rating: 4.7,
            reviewCount: 2100,
            duration: '8 Saat',
            level: 'Tüm Seviyeler',
            icon: 'file-text',
            color: '#f59e0b',
            price: 20.00,
            isPublished: true,
            description: 'Uluslararası ticarette risk ve maliyet dağılımını belirleyen Incoterms kurallarının detaylı analizi.'
        }
    ];

    for (const course of courses) {
        try {
            const added = await FirestoreService.addAd(course); // Temporary using addAd for generic collection if needed or I should add addCourse
            console.log(`[SEED] Course added: ${course.title}`);
        } catch (e) {
            console.error(`[SEED] Failed to add course: ${course.title}`, e);
        }
    }

    // 2. Seed Initial Ads
    const ads = [
        {
            ownerId: 'system_admin',
            transport: 'sea',
            origin: 'Istanbul Ambarlı',
            destination: 'New York JKF',
            goodsType: 'Yedek Parça',
            cargoCategory: 'Genel Kargo',
            weight: '2500 kg',
            totalCBM: 12,
            isStackable: true,
            deadline: '2026-06-15',
            status: 'active',
            expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000)
        },
        {
            ownerId: 'system_admin',
            transport: 'land',
            origin: 'Bursa',
            destination: 'Berlin',
            goodsType: 'Tekstil',
            cargoCategory: 'Genel Kargo',
            weight: '5000 kg',
            totalCBM: 25,
            isStackable: false,
            deadline: '2026-06-20',
            status: 'active',
            expiryDate: Date.now() + (15 * 24 * 60 * 60 * 1000)
        }
    ];

    for (const ad of ads) {
        try {
            await FirestoreService.addAd(ad);
            console.log(`[SEED] Ad added: ${ad.origin} -> ${ad.destination}`);
        } catch (e) {
            console.error(`[SEED] Failed to add ad`, e);
        }
    }

    console.log('[SEED] Seeding completed.');
};
