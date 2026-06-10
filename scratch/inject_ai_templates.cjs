const fs = require('fs');

const localesDir = 'c:\\Users\\Ömer\\.gemini\\antigravity\\scratch\\my-first-react-site\\public\\locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const enAiTpl = {
    "fcl_req_name": "FCL Rate Request",
    "fcl_req_sub": "Rate Request - {{POL}} / {{POD}} - {{CONTAINER_TYPE}} x{{QTY}} - {{LOAD_DATE}}",
    "fcl_req_body": "Dear {{CARRIER_NAME}},\n\nWe are requesting a spot freight rate for the following cargo:\n\nPOL: {{POL}}\nPOD: {{POD}}\nContainer: {{CONTAINER_TYPE}} x {{QTY}}\nLoad Date: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nCargo: {{CARGO_TYPE}}\n\nPlease provide an all-in rate and validity.\n\nThanks,\n{{SIGNATURE}}",
    
    "fcl_off_name": "FCL Customer Offer",
    "fcl_off_sub": "Freight Offer - {{POL}} / {{POD}} - {{CONTAINER_TYPE}} x{{QTY}}",
    "fcl_off_body": "Dear {{CUSTOMER_NAME}},\n\nBased on your request, please find our freight offer below:\n\nRoute: {{POL}} → {{POD}}\nContainer: {{CONTAINER_TYPE}} x {{QTY}}\nLoad Date: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nFreight (All-in): USD {{FREIGHT_PRICE}} / container\nValidity: {{VALIDITY}}\n\nPlease feel free to contact us for any questions.\n\nBest regards,\n{{SIGNATURE}}",
    
    "fcl_neg_name": "FCL Negotiation",
    "fcl_neg_sub": "Re: Rate Request - {{POL}} / {{POD}} - Revision Requested",
    "fcl_neg_body": "Dear {{CARRIER_NAME}},\n\nThanks for your rate. However, to meet our customer's budget, we need a revision to USD {{TARGET_PRICE}}.\n\nYour rate: USD {{FREIGHT_PRICE}}\nTarget: USD {{TARGET_PRICE}}\nDiff: USD {{DIFF}}\n\nWe have regular volume on this route. Looking forward to your revised rate.\n\nThanks,\n{{SIGNATURE}}",
    
    "fcl_fol_name": "FCL Follow-up",
    "fcl_fol_sub": "Status Update - {{POL}} / {{POD}} - {{CONTAINER_TYPE}}",
    "fcl_fol_body": "Dear {{CARRIER_NAME}},\n\nAny update on our recent rate request for {{POL}} - {{POD}}?\n\nOur customer is waiting urgently, we'd appreciate if you could send it today.\n\nBest,\n{{SIGNATURE}}",
    
    "common_name": "Common Template",
    "common_sub": "Inquiry - {{POL}} / {{POD}}",
    "common_body": "Dear Sir/Madam,\n\nPlease provide your best rate for the details below.\n\nPOL: {{POL}}\nPOD: {{POD}}\n\nThanks,\n{{SIGNATURE}}",

    "lbl_pol": "Port of Loading (POL)",
    "lbl_pod": "Port of Discharge (POD)",
    "lbl_cont": "Container Type (e.g., 20DC, 40HC)",
    "lbl_qty": "Quantity",
    "lbl_load_date": "Load Date",
    "lbl_incoterm": "Delivery Terms (Incoterm)",
    "lbl_cargo": "Cargo Type",
    "lbl_cbm": "Volume (CBM)",
    "lbl_pkg_qty": "Package Quantity",
    "lbl_vol_weight": "Volumetric Weight (Air)",
    "lbl_dim": "Dimensions",
    "lbl_flight": "Flight Route",
    "lbl_truck_type": "Truck Type",
    "lbl_ldm": "Loading Meters (LDM)",
    "lbl_kg": "Weight (KG)",
    "lbl_customs": "Customs Point",
    "lbl_route": "Route",
    "lbl_truck_qty": "Truck Quantity",
    
    "cat_armator": "Shipowner",
    "cat_agency": "Agency",
    "cat_air": "Air Freight",
    "cat_road": "Road Freight"
};

const trAiTpl = {
    "fcl_req_name": "FCL Rate Request",
    "fcl_req_sub": "Rate Request - {{POL}} / {{POD}} - {{CONTAINER_TYPE}} x{{QTY}} - {{LOAD_DATE}}",
    "fcl_req_body": "Sayın {{CARRIER_NAME}},\n\nAşağıdaki yük için spot navlun fiyatı talep ediyoruz:\n\nPOL: {{POL}}\nPOD: {{POD}}\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nYük Cinsi: {{CARGO_TYPE}}\n\nAll-in fiyat bekliyoruz. Fiyatınızı geçerlilik süresiyle birlikte iletirseniz seviniriz.\n\nTeşekkürler,\n{{SIGNATURE}}",
    
    "fcl_off_name": "FCL Müşteri Teklifi",
    "fcl_off_sub": "Navlun Teklifi - {{POL}} / {{POD}} - {{CONTAINER_TYPE}} x{{QTY}}",
    "fcl_off_body": "Sayın {{CUSTOMER_NAME}},\n\nTalebiniz doğrultusunda aşağıdaki navlun teklifini sunmaktayız:\n\nGüzergah: {{POL}} → {{POD}}\nKonteyner: {{CONTAINER_TYPE}} x {{QTY}}\nYükleme Tarihi: {{LOAD_DATE}}\nIncoterm: {{INCOTERM}}\nNavlun (All-in): USD {{FREIGHT_PRICE}} / konteyner\nFiyat Geçerliliği: {{VALIDITY}}\n\nSorularınız için her zaman ulaşabilirsiniz.\n\nSaygılarımızla,\n{{SIGNATURE}}",
    
    "fcl_neg_name": "FCL Pazarlık",
    "fcl_neg_sub": "Re: Rate Request - {{POL}} / {{POD}} - Revize Talep",
    "fcl_neg_body": "Sayın {{CARRIER_NAME}},\n\nVerdiğiniz fiyat için teşekkür ederiz. Ancak müşterimizin bütçesi doğrultusunda USD {{TARGET_PRICE}} seviyesinde revize talep ediyoruz.\n\nMevcut fiyatınız: USD {{FREIGHT_PRICE}}\nBeklenen fiyat: USD {{TARGET_PRICE}}\nFark: USD {{DIFF}}\n\nBu güzergahta düzenli yük potansiyelimiz bulunmaktadır. Revizenizi bekliyoruz.\n\nTeşekkürler,\n{{SIGNATURE}}",
    
    "fcl_fol_name": "FCL Takip",
    "fcl_fol_sub": "Durum Sorgulama - {{POL}} / {{POD}} - {{CONTAINER_TYPE}}",
    "fcl_fol_body": "Sayın {{CARRIER_NAME}},\n\nGeçtiğimiz günlerde ilettiğimiz {{POL}} - {{POD}} talebimizle ilgili fiyat çalışmanız tamamlandı mı?\n\nMüşterimizden acil dönüş bekliyoruz, navlunu bugün iletebilirseniz çok seviniriz.\n\nİyi çalışmalar,\n{{SIGNATURE}}",
    
    "common_name": "Ortak Şablon",
    "common_sub": "Talep - {{POL}} / {{POD}}",
    "common_body": "Sayın İlgili,\n\nAşağıdaki detaylara istinaden fiyat çalışmanızı rica ederiz.\n\nPOL: {{POL}}\nPOD: {{POD}}\n\nTeşekkürler,\n{{SIGNATURE}}",

    "lbl_pol": "Yükleme Limanı (POL)",
    "lbl_pod": "Varış Limanı (POD)",
    "lbl_cont": "Konteyner Tipi (Örn: 20DC, 40HC)",
    "lbl_qty": "Adet",
    "lbl_load_date": "Yükleme Tarihi",
    "lbl_incoterm": "Teslim Şekli (Incoterm)",
    "lbl_cargo": "Yük Cinsi",
    "lbl_cbm": "Hacim (CBM)",
    "lbl_pkg_qty": "Paket Adedi",
    "lbl_vol_weight": "Hacimsel Ağırlık (Air)",
    "lbl_dim": "Boyutlar",
    "lbl_flight": "Uçuş Parkuru",
    "lbl_truck_type": "Araç Tipi",
    "lbl_ldm": "Yükleme Metresi (LDM)",
    "lbl_kg": "Ağırlık (KG)",
    "lbl_customs": "Gümrük Noktası",
    "lbl_route": "Güzergah",
    "lbl_truck_qty": "Araç Adedi",
    
    "cat_armator": "Armatör",
    "cat_agency": "Acente",
    "cat_air": "Hava Nakliye",
    "cat_road": "Kara Nakliye"
};

for (const file of files) {
    const filePath = require('path').join(localesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (file === 'tr.json') {
        data.ai_tpl = trAiTpl;
    } else {
        data.ai_tpl = enAiTpl;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
console.log('Template translations injected into JSON files.');
