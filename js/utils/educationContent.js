window.educationContent = {
    chapters: [
        {
            id: 'intro',
            title: '1. GİRİŞ',
            badge: 'TEMEL',
            readTime: '5 dk',
            icon: 'play-circle',
            sections: [
                {
                    title: 'Lojistik Nedir?',
                    content: 'Lojistik, doğru ürünün, doğru miktarda, doğru durumda, doğru zamanda, doğru yerden, doğru fiyata ve doğru müşteriye ulaştırılması sürecidir. Sadece taşıma değil; depolama, paketleme, gümrükleme ve bilgi akışının yönetimidir.',
                    highlights: ['7 Doğru (7R) kuralı lojistiğin temelidir.', 'Tedarik zincirinin operasyonel koludur.']
                },
                {
                    title: 'Freight Forwarder Nedir?',
                    content: 'Freight Forwarder (Taşıma İşleri Organizatörü), eşya taşımacılığında gönderen ile taşıyıcı arasında köprü görevi gören profesyonel bir aracıdır. Kendisi fiziksel olarak gemi veya uçak sahibi olmasa da, tüm süreci organize eder ve hukuki sorumluluk üstlenir.',
                    highlights: ['Taşımacılığın mimarıdır.', 'Farklı taşıma modlarını birleştirerek multimodal çözümler sunar.']
                },
                {
                    title: 'Sektörün Genel Yapısı',
                    content: 'Lojistik ekosistemi şu ana aktörlerden oluşur: <br>• <b>Shipper (Yükleyici):</b> Malın sahibi/ihracatçı.<br>• <b>Carrier (Taşıyıcı):</b> Gemi hattı, havayolu veya tır firması.<br>• <b>Forwarder:</b> Organizatör.<br>• <b>Consignee (Alıcı):</b> Malın varış noktasındaki sahibi.',
                    icon: 'network'
                }
            ]
        },
        {
            id: 'terms',
            title: '2. TEMEL KAVRAMLAR & TERİMLER',
            badge: 'SÖZLÜK',
            readTime: '15 dk',
            icon: 'book-open',
            sections: [
                {
                    title: 'Operasyonel Dil (A-Z Lojistik Sözlüğü)',
                    content: 'Sektörde kullanılan en yaygın terimler ve kısaltmalar:',
                    glossary: [
                        { term: 'AWB', desc: 'Air Waybill (Havayolu Taşıma Senedi)' },
                        { term: 'B/L', desc: 'Bill of Lading (Denizyolu Konşimentosu)' },
                        { term: 'CBM', desc: 'Cubic Meter (Metreküp - Hacim birimi)' },
                        { term: 'CMR', desc: 'Karayolu Taşıma Sözleşmesi' },
                        { term: 'Demurrage', desc: 'Demoraj (Konteynerin limanda bekletilme cezası)' },
                        { term: 'ETA', desc: 'Estimated Time of Arrival (Tahmini Varış Zamanı)' },
                        { term: 'ETD', desc: 'Estimated Time of Departure (Tahmini Kalkış Zamanı)' },
                        { term: 'FCL', desc: 'Full Container Load (Tam Konteyner Yükü)' },
                        { term: 'LCL', desc: 'Less than Container Load (Parsiyel Konteyner Yükü)' },
                        { term: 'POD', desc: 'Port of Discharge (Tahliye Limanı) veya Proof of Delivery' },
                        { term: 'POL', desc: 'Port of Loading (Yükleme Limanı)' },
                        { term: 'THC', desc: 'Terminal Handling Charge (Terminal Elleçleme Ücreti)' }
                    ]
                }
            ]
        },
        {
            id: 'incoterms',
            title: '3. INCOTERMS (TESLİM ŞEKİLLERİ)',
            badge: 'KRİTİK',
            readTime: '12 dk',
            icon: 'shield-check',
            sections: [
                {
                    title: 'Incoterms 2020 Nedir?',
                    content: 'Uluslararası Ticaret Odası (ICC) tarafından yayınlanan, alıcı ve satıcı arasındaki risk, maliyet ve sorumluluk dağılımını belirleyen standart kurallardır.',
                    incoterms: [
                        { code: 'EXW', name: 'Ex Works', mode: 'all', risk: 'Satıcı Kapısı', cost: 'Alıcı', desc: 'Satıcı malı fabrikasında hazır eder. Yükleme dahil tüm risk alıcıdadır.' },
                        { code: 'FCA', name: 'Free Carrier', mode: 'all', risk: 'Teslim Noktası', cost: 'Alıcı (Navlun)', desc: 'Satıcı malı belirlenen taşıyıcıya teslim eder. En esnek terimdir.' },
                        { code: 'CPT', name: 'Carriage Paid To', mode: 'all', risk: 'İlk Taşıyıcı', cost: 'Satıcı (Navlun)', desc: 'Satıcı navlunu öder ancak risk malı ilk taşıyıcıya verince geçer.' },
                        { code: 'CIP', name: 'Carriage & Ins. Paid', mode: 'all', risk: 'İlk Taşıyıcı', cost: 'Satıcı (Navlun+Sigorta)', desc: 'CPT + Kapsamlı sigorta. Satıcı sigortayı alıcı lehine yapar.' },
                        { code: 'DAP', name: 'Delivered at Place', mode: 'all', risk: 'Varış Noktası', cost: 'Satıcı (Kapı)', desc: 'Satıcı malı varış noktasına kadar getirir. Boşaltma alıcıya aittir.' },
                        { code: 'DPU', name: 'Delivered at Place Unloaded', mode: 'all', risk: 'Boşaltma Sonrası', cost: 'Satıcı (Kapı+Boşaltma)', desc: 'Eski DAT. Satıcı malı boşaltarak teslim eder.' },
                        { code: 'DDP', name: 'Delivered Duty Paid', mode: 'all', risk: 'Varış Noktası', cost: 'Satıcı (Hepsi Dahil)', desc: 'Satıcı gümrük vergileri dahil her şeyi öder.' },
                        { code: 'FAS', name: 'Free Alongside Ship', mode: 'sea', risk: 'Gemi Yanı', cost: 'Alıcı', desc: 'Satıcı malı geminin bordasına/rıhtımına bırakır.' },
                        { code: 'FOB', name: 'Free On Board', mode: 'sea', risk: 'Gemi Güvertesi', cost: 'Alıcı', desc: 'Satıcı malı gemiye yükleyene kadar sorumludur.' },
                        { code: 'CFR', name: 'Cost and Freight', mode: 'sea', risk: 'Gemi Güvertesi', cost: 'Satıcı (Navlun)', desc: 'Navlun satıcıdan, risk gemiye yüklenince alıcıdan.' },
                        { code: 'CIF', name: 'Cost, Ins. & Freight', mode: 'sea', risk: 'Gemi Güvertesi', cost: 'Satıcı (Navlun+Sigorta)', desc: 'Navlun ve sigorta satıcıdan. Denizyolunda en yaygın şekil.' }
                    ],
                    table: [
                        { term: 'EXW', export: 'Alıcı', loading: 'Alıcı', freight: 'Alıcı', import: 'Alıcı', risk: 'Satıcı Kapısı' },
                        { term: 'FOB', export: 'Satıcı', loading: 'Satıcı', freight: 'Alıcı', import: 'Alıcı', risk: 'Gemi Güvertesi' },
                        { term: 'CIF', export: 'Satıcı', loading: 'Satıcı', freight: 'Satıcı', import: 'Alıcı', risk: 'Gemi Güvertesi' },
                        { term: 'DDP', export: 'Satıcı', loading: 'Satıcı', freight: 'Satıcı', import: 'Satıcı', risk: 'Alıcı Kapısı' }
                    ]
                }
            ]
        },
        {
            id: 'modes-overview',
            title: '4. TAŞIMA TÜRLERİNE GENEL BAKIŞ',
            badge: 'STRATEJİ',
            readTime: '8 dk',
            icon: 'layers',
            sections: [
                {
                    title: 'Taşıma Modlarının Karşılaştırılması',
                    content: 'Yükün cinsine, aciliyetine ve bütçeye göre doğru modu seçmek maliyetleri %30-40 oranında etkileyebilir.',
                    comparison: [
                        { mode: 'Denizyolu', speed: 'Düşük', cost: 'En Düşük', capacity: 'En Yüksek' },
                        { mode: 'Havayolu', speed: 'En Yüksek', cost: 'En Yüksek', capacity: 'Düşük' },
                        { mode: 'Karayolu', speed: 'Orta', cost: 'Orta', capacity: 'Orta' },
                        { mode: 'Demiryolu', speed: 'Düşük/Orta', cost: 'Düşük', capacity: 'Yüksek' }
                    ]
                },
                {
                    title: 'Multimodal Taşımacılık',
                    content: 'Tek bir sözleşme ile birden fazla taşıma modunun (örn: Gemi + Tır) kullanılmasıdır. Forwarder\'lar genellikle bu süreci tek bir konşimento (Combined Transport B/L) ile yönetir.',
                    icon: 'git-merge'
                }
            ]
        },
        {
            id: 'sea',
            title: '🚢 5. DENİZYOLU TAŞIMACILIĞI',
            badge: 'HACİM',
            readTime: '10 dk',
            icon: 'ship',
            sections: [
                {
                    title: 'FCL vs LCL',
                    content: '<b>FCL (Full Container):</b> Konteynerin tamamı tek bir yükleyiciye aittir.<br><b>LCL (Less Container):</b> Birden fazla yükleyicinin malı tek bir konteynerde birleştirilir (Konsolidasyon).',
                    highlights: ['LCL taşımalarda CBM üzerinden fiyatlandırma yapılır.', 'FCL taşımalarda "Container Seal" güvenliği esastır.']
                },
                {
                    title: 'Liman Süreçleri',
                    content: 'Limanlarda operasyon; gemi yanaşması, tahliye (discharge), gümrük muayenesi ve kapı çıkışı (gate-out) aşamalarından oluşur.',
                    icon: 'anchor'
                }
            ]
        },
        {
            id: 'air',
            title: '✈️ 6. HAVAYOLU TAŞIMACILIĞI',
            badge: 'HIZ',
            readTime: '7 dk',
            icon: 'plane',
            sections: [
                {
                    title: 'Hangi Yükler İçin Uygun?',
                    content: 'Acil parçalar, bozulabilir gıdalar, yüksek değerli elektronikler ve ilaçlar genellikle havayolu ile taşınır.',
                    highlights: ['En güvenli taşıma modudur.', 'Envanter maliyetlerini düşürür.']
                },
                {
                    title: 'Chargeable Weight (Ücrete Esas Ağırlık)',
                    content: 'Havayolunda hesaplama <b>1:6</b> oranına dayanır. Yani 1 m³ yük 167 kg kabul edilir. Gerçek ağırlık ile hacimsel ağırlıktan hangisi büyükse o fatura edilir.',
                    formula: 'En x Boy x Yükseklik (cm) / 6000'
                }
            ]
        },
        {
            id: 'road',
            title: '🚛 7. KARAYOLU TAŞIMACILIĞI',
            badge: 'ESNEKLİK',
            readTime: '8 dk',
            icon: 'truck',
            sections: [
                {
                    title: 'Avrupa Hattı ve Transit Süreler',
                    content: 'Türkiye\'nin dış ticaretinde Avrupa yönü karayolu ile domine edilmektedir. Ekspres tır servisleri ile Avrupa\'nın içlerine 48-72 saatte ulaşım mümkündür.',
                    highlights: ['Parsiyel yüklemeler için LDM (Lademeter) hesabı kullanılır.', 'Transit rejimleri (T1, T2) gümrük geçişlerini kolaylaştırır.']
                }
            ]
        },
        {
            id: 'costs',
            title: '8. NAVLUN & MALİYET HESAPLAMA',
            badge: 'FİNANS',
            readTime: '12 dk',
            icon: 'calculator',
            sections: [
                {
                    title: 'Navlun Hesaplama Mantığı',
                    content: 'Navlun fiyatı sadece taşıma ücreti değildir. İçine eklenen birçok kalem vardır:',
                    list: [
                        '<b>BAF:</b> Yakıt ayarlama faktörü.',
                        '<b>CAF:</b> Kur ayarlama faktörü.',
                        '<b>THC:</b> Terminal elleçleme.',
                        '<b>Documentation:</b> Evrak masrafı.'
                    ]
                },
                {
                    title: 'LCL (Deniz) Hesaplama Örneği',
                    content: 'Deniz parsiyelde 1 m³ = 1 Ton kabul edilir (W/M - Weight or Measurement).',
                    example: '2 m³ ve 500 kg olan bir yük 2 Ton (veya 2 CBM) üzerinden fiyatlandırılır.'
                }
            ]
        },
        {
            id: 'containers',
            title: '9. KONTEYNERLER & ÖLÇÜLER',
            badge: 'EKİPMAN',
            readTime: '6 dk',
            icon: 'box',
            sections: [
                {
                    title: 'Standart ve Özel Konteynerler',
                    content: 'Yüke göre doğru ekipman seçimi hem hasarı önler hem maliyeti düşürür.',
                    containers: [
                        { type: '20\' DC', vol: '33 m³', use: 'Ağır yükler (Mermer, Maden)' },
                        { type: '40\' DC', vol: '67 m³', use: 'Genel kargo' },
                        { type: '40\' HC', vol: '76 m³', use: 'Hafif ama hacimli yükler' },
                        { type: '40\' RF', vol: 'Reefer', use: 'Soğuk zincir (Gıda, İlaç)' },
                        { type: '40\' OT', vol: 'Open Top', use: 'Üstten yüklenen makine' }
                    ]
                }
            ]
        },
        {
            id: 'documents',
            title: '10. BELGELER (EN KRİTİK BÖLÜM)',
            badge: 'OPERASYON',
            readTime: '20 dk',
            icon: 'file-text',
            sections: [
                {
                    title: 'Operasyonun Kalbi: Evraklar',
                    content: 'Doğru evrak seti olmadan gümrükleme yapılamaz ve yük teslim alınamaz.',
                    docs: [
                        { name: 'Bill of Lading (B/L)', desc: 'Mülkiyet belgesi. Teslimat için orijinali şarttır (Telex hariç).' },
                        { name: 'Commercial Invoice', desc: 'Gümrük vergisinin hesaplandığı ana fatura.' },
                        { name: 'Packing List', desc: 'Yükün koli bazlı dökümü.' },
                        { name: 'Certificate of Origin', desc: 'Menşe şahadetnamesi. Vergi indirimleri için kritiktir.' },
                        { name: 'CMR', desc: 'Karayolu taşıma senedi. 3 asıl 3 kopya düzenlenir.' }
                    ]
                }
            ]
        },
        {
            id: 'customs',
            title: '11. GÜMRÜK SÜREÇLERİ',
            badge: 'MEVZUAT',
            readTime: '10 dk',
            icon: 'landmark',
            sections: [
                {
                    title: 'İhracat ve İthalat Akışı',
                    content: '<b>İhracat:</b> Malın beyannamesi açılır, gümrük kontrolü yapılır, araç mühürlenir ve çıkış onayı verilir.<br><b>İthalat:</b> Mal varış gümrüğüne gelir, vergiler hesaplanır ve ödenir, muayene sonrası millileşir.',
                    highlights: ['GTİP Kodu: Her ürünün dünyada standart bir kodu vardır.', 'Kırmızı Hat: Fiziki muayene gereken riskli gönderiler.']
                }
            ]
        },
        {
            id: 'management',
            title: '12. OPERASYON YÖNETİMİ',
            badge: 'KARİYER',
            readTime: '9 dk',
            icon: 'briefcase',
            sections: [
                {
                    title: 'Müşteri İletişimi ve Takip',
                    content: 'Forwarder operasyoncusu bir orkestra şefidir. Müşteriye "Yükünüz nerede?" sorusu sormadan bilgi (Status Report) vermelidir.',
                    list: [
                        'Booking onayı gönderme.',
                        'Yükleme resimlerini paylaşma.',
                        'Varış öncesi ihbar (Arrival Notice) yapma.'
                    ]
                }
            ]
        },
        {
            id: 'risks',
            title: '13. RİSKLER & PROBLEMLER',
            badge: 'TECRÜBE',
            readTime: '11 dk',
            icon: 'alert-triangle',
            sections: [
                {
                    title: 'Gecikmeler ve Hasar Yönetimi',
                    content: 'Lojistikte her şey planlandığı gibi gitmeyebilir. Kriz yönetimi sizi profesyonel yapar.',
                    list: [
                        '<b>Rollover:</b> Yükün gemiye sığmaması ve bir sonraki gemiye kalması.',
                        '<b>Shortage:</b> Malın eksik çıkması.',
                        '<b>Detention:</b> Konteynerin kapı dışarısında fazla bekletilmesi.'
                    ]
                }
            ]
        },
        {
            id: 'expert',
            title: '14. UZMANLIK BİLGİLERİ',
            badge: 'İLERİ',
            readTime: '15 dk',
            icon: 'award',
            sections: [
                {
                    title: 'Tehlikeli Madde (DG) Taşımacılığı',
                    content: 'IMDG kodlarına göre sınıflanır (Class 1-9). Özel etiketleme ve MSDS formu zorunludur.',
                    icon: 'flame'
                },
                {
                    title: 'Soğuk Zincir ve Proje',
                    content: 'Aşılar -20C veya +2/+8C aralığında taşınmalıdır. Gabari dışı (aşırı büyük) yükler için Lowbed tırlar kullanılır.',
                    icon: 'thermometer'
                }
            ]
        },
        {
            id: 'examples',
            title: '15. ÖRNEKLER & UYGULAMALAR',
            badge: 'CASE STUDY',
            readTime: '15 dk',
            icon: 'check-circle',
            sections: [
                {
                    title: 'Senaryo: İstanbul\'dan New York\'a Yedek Parça Sevkiyatı',
                    content: 'FOB İstanbul teslim şekliyle 2 tonluk yük için süreç:<br>1. Fabrika yükü limana getirir.<br>2. Gümrükleme yükleyici tarafından yapılır.<br>3. Konşimento basılır ve mühür vurulur.<br>4. Gemi yola çıkar, 18-22 gün sonra NY limanına varır.',
                    highlights: ['Alıcı NY\'da navlunu öder ve malı çeker.']
                }
            ]
        },
        {
            id: 'appendices',
            title: '16. EKLER',
            badge: 'ARAÇLAR',
            readTime: 'SÜRESİZ',
            icon: 'plus-square',
            sections: [
                {
                    title: 'Check-listler ve Tablolar',
                    content: 'Operasyona başlamadan önce kontrol etmeniz gerekenler listesi.',
                    list: [
                        'Evraklar tam mı?',
                        'Konteyner tipi doğru mu?',
                        'Sigorta yapıldı mı?',
                        'GTİP kodu doğru mu?'
                    ]
                }
            ]
        }
    ]
};
