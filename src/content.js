// Bilingual site content. Every string is either plain text or [english, arabic].

const site = {
  name: ['Exotic Tint Qatar', 'إكزوتك تينت قطر'],
  domain: 'https://exotictintqatar.com',
  phone: '+974 3160 8423',
  phoneRaw: '+97431608423',
  whatsapp: '97431608423',
  email: 'contact@exotictintqatar.com',
  instagram: 'https://www.instagram.com/exotic_tint_qatar/',
  facebook: 'https://www.facebook.com/people/Exotics-Window-Tintin/61559300550958/',
  tiktok: 'https://www.tiktok.com/@exotic_window_tinting_qa',
  address: ['Doha, Qatar', 'الدوحة، قطر'],
  hours: ['8:00 AM – 6:00 PM · 7 days a week', '٨:٠٠ صباحاً – ٦:٠٠ مساءً · ٧ أيام في الأسبوع'],
  tagline: ['Premium Tint & Protective Films', 'أفلام تظليل وحماية فاخرة'],
};

const ui = {
  nav: {
    home: ['Home', 'الرئيسية'],
    about: ['About', 'من نحن'],
    services: ['Services', 'خدماتنا'],
    contact: ['Contact', 'تواصل معنا'],
    allServices: ['All services', 'جميع الخدمات'],
  },
  quote: ['Get a free quote', 'احصل على عرض سعر مجاني'],
  bookNow: ['Book now', 'احجز الآن'],
  callUs: ['Call us', 'اتصل بنا'],
  whatsapp: ['WhatsApp us', 'راسلنا على واتساب'],
  explore: ['Explore services', 'استكشف خدماتنا'],
  learnMore: ['Learn more', 'اعرف المزيد'],
  viewService: ['View service', 'عرض الخدمة'],
  langSwitch: ['العربية', 'English'],
  menu: ['Menu', 'القائمة'],
  close: ['Close', 'إغلاق'],
  skip: ['Skip to content', 'انتقل إلى المحتوى'],
  rights: ['All rights reserved.', 'جميع الحقوق محفوظة.'],
  quickLinks: ['Quick links', 'روابط سريعة'],
  getInTouch: ['Get in touch', 'تواصل معنا'],
  followUs: ['Follow us', 'تابعنا'],
  hoursLabel: ['Business hours', 'ساعات العمل'],
  footerBlurb: [
    'Premium window tint and surface protection for cars, homes and businesses across Qatar — installed on-site by specialists.',
    'تظليل نوافذ وحماية أسطح فاخرة للسيارات والمنازل والشركات في جميع أنحاء قطر — يركّبها مختصون في موقعك.',
  ],
};

const services = [
  {
    slug: 'automotive-window-tinting',
    img: 'automotive',
    icon: 'car',
    title: ['Automotive Window Tinting', 'تظليل زجاج السيارات'],
    short: ['Cars & fleets', 'السيارات والأساطيل'],
    summary: [
      'Premium heat rejection, UV protection and privacy for every vehicle — with mobile, at-home installation.',
      'عزل حراري فائق وحماية من الأشعة فوق البنفسجية وخصوصية لكل سيارة — مع خدمة التركيب المتنقل في منزلك.',
    ],
    headline: ['A cooler cabin. A sharper look.', 'مقصورة أبرد. ومظهر أكثر أناقة.'],
    intro: [
      'Elevate your drive with automotive window tinting from Exotic Tint Qatar. Our premium films enhance privacy, reduce heat and protect your interior from Qatar’s harsh sun — whether you’re navigating Doha’s busy streets or parked under the blazing desert sky.',
      'ارتقِ بتجربة قيادتك مع تظليل زجاج السيارات من إكزوتك تينت قطر. أفلامنا الفاخرة تعزز الخصوصية وتقلل الحرارة وتحمي المقصورة من شمس قطر القاسية — سواء كنت تتنقل في شوارع الدوحة أو كانت سيارتك متوقفة تحت شمس الصحراء.',
    ],
    whatIs: [
      'A thin, high-performance film applied to your vehicle’s glass that blocks UV rays, cuts glare and regulates interior temperature while adding a sleek finish. Unlike basic shades, our films use advanced materials engineered for Qatar’s intense sunlight and dust.',
      'فيلم رقيق عالي الأداء يُثبَّت على زجاج سيارتك، يحجب الأشعة فوق البنفسجية ويقلل الوهج وينظّم حرارة المقصورة مع لمسة أنيقة. وعلى عكس الأفلام العادية، تعتمد أفلامنا على مواد متطورة صُممت لتحمّل شمس قطر القوية والغبار.',
    ],
    benefits: [
      [['Heat reduction', 'تقليل الحرارة'], ['Blocks up to 60% of solar heat for a noticeably cooler cabin.', 'يحجب حتى ٦٠٪ من حرارة الشمس لمقصورة أبرد بشكل ملحوظ.']],
      [['99% UV protection', 'حماية ٩٩٪ من الأشعة'], ['Shields skin and upholstery from harmful rays.', 'يحمي البشرة والمفروشات من الأشعة الضارة.']],
      [['Glare control', 'التحكم في الوهج'], ['Reduces eye strain for safer day and night driving.', 'يقلل إجهاد العين لقيادة أكثر أماناً ليلاً ونهاراً.']],
      [['Privacy', 'الخصوصية'], ['Keeps passengers and belongings out of sight.', 'يُبقي الركاب والمقتنيات بعيداً عن الأنظار.']],
      [['Fuel efficiency', 'توفير الوقود'], ['Less AC load means better efficiency on every trip.', 'حمل أقل على المكيف يعني كفاءة أعلى في كل رحلة.']],
      [['Interior preservation', 'الحفاظ على المقصورة'], ['Prevents fading and cracking of seats and dashboards.', 'يمنع بهتان وتشقق المقاعد ولوحة القيادة.']],
    ],
    uses: [
      [['Daily drivers', 'السيارات اليومية'], ['Comfort on every commute through Doha and beyond.', 'راحة في كل مشوار داخل الدوحة وخارجها.']],
      [['Family cars', 'سيارات العائلة'], ['Protect children and upholstery from UV and heat.', 'حماية الأطفال والمفروشات من الأشعة والحرارة.']],
      [['Luxury vehicles', 'السيارات الفاخرة'], ['Privacy and a polished look for high-end models.', 'خصوصية ومظهر راقٍ للطرازات الفاخرة.']],
      [['Commercial fleets', 'الأساطيل التجارية'], ['Keep taxis, vans and company cars cool and professional.', 'سيارات أجرة وشاحنات وسيارات شركات باردة ومظهر احترافي.']],
    ],
    faq: [
      [['Do you offer mobile car tinting?', 'هل تقدمون خدمة تظليل السيارات المتنقلة؟'], ['Yes. We offer car window tinting as a home service — our team comes to your home or office anywhere in Doha, Lusail, Al Rayyan and surrounding areas.', 'نعم. نقدم خدمة تظليل السيارات في المنزل — يأتي فريقنا إلى منزلك أو مكتبك في الدوحة ولوسيل والريان والمناطق المحيطة.']],
      [['Which tint shade should I choose?', 'ما درجة التظليل المناسبة لي؟'], ['It depends on your priorities — privacy, heat reduction or looks. During consultation we recommend a shade and film type that suits your car and complies with local regulations.', 'يعتمد ذلك على أولوياتك — الخصوصية أو تقليل الحرارة أو المظهر. خلال الاستشارة نوصي بالدرجة ونوع الفيلم المناسبين لسيارتك وبما يتوافق مع الأنظمة المحلية.']],
      [['How long does installation take?', 'كم تستغرق عملية التركيب؟'], ['Most vehicles are completed within a few hours, including preparation, application, finishing and a final quality inspection.', 'تُنجز معظم السيارات خلال ساعات قليلة، بما في ذلك التحضير والتركيب والتشطيب والفحص النهائي للجودة.']],
    ],
  },
  {
    slug: 'residential-window-tinting-services',
    img: 'residential',
    icon: 'home',
    title: ['Residential Window Tinting', 'تظليل نوافذ المنازل'],
    short: ['Villas & apartments', 'الفلل والشقق'],
    summary: [
      'Ceramic, privacy and heat-rejection films that keep your home cool, private and beautifully lit.',
      'أفلام سيراميك وخصوصية وعزل حراري تُبقي منزلك بارداً وخاصاً ومضاءً بشكل جميل.',
    ],
    headline: ['Natural light. Without the heat.', 'ضوء طبيعي. دون حرارة.'],
    intro: [
      'Upgrade your home with residential window tinting from Exotic Tint Qatar. Our house tinting services feature ceramic films, privacy tinting and heat-rejection options that match your style and cut energy costs — without darkening your living spaces.',
      'جدّد منزلك مع خدمة تظليل النوافذ السكنية من إكزوتك تينت قطر. نقدم أفلام السيراميك وأفلام الخصوصية والعزل الحراري التي تناسب ذوقك وتخفض تكاليف الطاقة — دون أن تُعتم مساحات معيشتك.',
    ],
    whatIs: [
      'Residential tinting applies a high-performance film to the glass of your villa or apartment. It rejects solar heat, filters 99% of UV rays and adds daytime privacy, while keeping your views clear and your interiors protected from fading.',
      'التظليل السكني هو تركيب فيلم عالي الأداء على زجاج فيلتك أو شقتك. يصدّ حرارة الشمس ويحجب ٩٩٪ من الأشعة فوق البنفسجية ويضيف خصوصية نهارية، مع الحفاظ على وضوح الإطلالة وحماية الأثاث من البهتان.',
    ],
    benefits: [
      [['Heat rejection', 'عزل حراري'], ['Keeps rooms comfortable through Qatar’s hottest months.', 'يُبقي الغرف مريحة خلال أشد أشهر الصيف حرارة في قطر.']],
      [['Lower energy bills', 'فواتير كهرباء أقل'], ['Reduce AC load and electricity costs year-round.', 'خفّض حمل التكييف وتكاليف الكهرباء طوال العام.']],
      [['99% UV filtering', 'حجب ٩٩٪ من الأشعة'], ['Protects your family, floors and furniture.', 'يحمي عائلتك وأرضياتك وأثاثك.']],
      [['Daytime privacy', 'خصوصية نهارية'], ['See out clearly while keeping prying eyes out.', 'رؤية واضحة للخارج مع حجب الأنظار من الخارج.']],
      [['Glare reduction', 'تقليل الوهج'], ['Comfortable screens and reading spaces.', 'شاشات ومساحات قراءة مريحة.']],
      [['Added safety', 'أمان إضافي'], ['Film helps hold glass together if it breaks.', 'يساعد الفيلم على تماسك الزجاج عند الكسر.']],
    ],
    uses: [
      [['Villas', 'الفلل'], ['Large glazed façades, majlis and family areas.', 'الواجهات الزجاجية الكبيرة والمجالس ومناطق العائلة.']],
      [['Apartments', 'الشقق'], ['Sun-facing balconies and floor-to-ceiling glass.', 'الشرفات المواجهة للشمس والزجاج الممتد من الأرض للسقف.']],
      [['Bedrooms', 'غرف النوم'], ['Better sleep with less heat and glare.', 'نوم أفضل مع حرارة ووهج أقل.']],
      [['Skylights', 'المناور'], ['Control overhead heat while keeping the light.', 'تحكم في الحرارة العلوية مع الحفاظ على الإضاءة.']],
    ],
    faq: [
      [['Will tint make my home dark?', 'هل سيجعل التظليل منزلي مظلماً؟'], ['No. Modern ceramic films reject heat without heavy darkening. We offer light, neutral and reflective options so you keep your natural light.', 'لا. أفلام السيراميك الحديثة تعزل الحرارة دون تعتيم كبير. نوفر خيارات فاتحة ومحايدة وعاكسة لتحتفظ بالإضاءة الطبيعية.']],
      [['Do you install on-site?', 'هل تقومون بالتركيب في الموقع؟'], ['Yes — every residential installation is done on-site at your home by our trained team.', 'نعم — تُنفَّذ جميع التركيبات السكنية في منزلك على يد فريقنا المدرّب.']],
      [['Can I get a free estimate?', 'هل يمكنني الحصول على تقدير مجاني؟'], ['Absolutely. Send us your window sizes or photos on WhatsApp and we’ll reply with a free, flat-rate estimate.', 'بالتأكيد. أرسل لنا مقاسات النوافذ أو صورها عبر واتساب وسنرد بتقدير مجاني بسعر ثابت.']],
    ],
  },
  {
    slug: 'commercial-window-tinting-services',
    img: 'commercial',
    icon: 'building',
    title: ['Commercial Window Tinting', 'تظليل المباني التجارية'],
    short: ['Offices & retail', 'المكاتب والمحلات'],
    summary: [
      'Energy-efficient, private and professional — one-way mirror, frosted and blackout films for every business.',
      'كفاءة في الطاقة وخصوصية ومظهر احترافي — أفلام عاكسة باتجاه واحد ومصنفرة وتعتيم كامل لكل الأعمال.',
    ],
    headline: ['Cooler buildings. Sharper business.', 'مبانٍ أبرد. وأعمال أكثر احترافية.'],
    intro: [
      'Enhance your business’s performance and appeal with commercial window tinting from Exotic Tint Qatar. Designed for offices, retail storefronts and commercial buildings, our films reduce cooling costs, protect interiors and create a professional atmosphere.',
      'عزّز أداء ومظهر أعمالك مع تظليل المباني التجارية من إكزوتك تينت قطر. أفلامنا مصممة للمكاتب وواجهات المحلات والمباني التجارية، تخفض تكاليف التبريد وتحمي التصميم الداخلي وتمنح أجواءً احترافية.',
    ],
    whatIs: [
      'Commercial window tinting applies high-performance films to business glazing to block heat, UV and glare while maintaining aesthetics. We customise every specification for Qatar’s hot, sunny environment so your property stays comfortable, secure and visually consistent year-round.',
      'تظليل المباني التجارية هو تركيب أفلام عالية الأداء على زجاج المنشآت لحجب الحرارة والأشعة فوق البنفسجية والوهج مع الحفاظ على المظهر. نخصص كل مواصفة لتناسب مناخ قطر الحار المشمس ليبقى عقارك مريحاً وآمناً ومتناسق المظهر طوال العام.',
    ],
    benefits: [
      [['Energy savings', 'توفير الطاقة'], ['Blocks solar heat and significantly cuts AC costs.', 'يحجب حرارة الشمس ويخفض تكاليف التكييف بشكل كبير.']],
      [['99% UV protection', 'حماية ٩٩٪ من الأشعة'], ['Protects employees, stock and fit-out.', 'يحمي الموظفين والبضائع والتجهيزات.']],
      [['Privacy boost', 'خصوصية أعلى'], ['Discreet operations without losing daylight.', 'عمل بخصوصية دون فقدان ضوء النهار.']],
      [['Glare reduction', 'تقليل الوهج'], ['Better visibility on screens and workstations.', 'رؤية أفضل على الشاشات ومحطات العمل.']],
      [['Professional look', 'مظهر احترافي'], ['A uniform, premium façade for your brand.', 'واجهة موحدة وفاخرة لعلامتك التجارية.']],
      [['Cost efficiency', 'كفاءة التكلفة'], ['Lower energy bills and maintenance expenses.', 'فواتير طاقة وتكاليف صيانة أقل.']],
    ],
    uses: [
      [['Offices', 'المكاتب'], ['Privacy in meeting rooms and less screen glare.', 'خصوصية في غرف الاجتماعات ووهج أقل على الشاشات.']],
      [['Retail stores', 'المحلات التجارية'], ['Protect merchandise and create inviting storefronts.', 'حماية البضائع وواجهات جذابة.']],
      [['Warehouses', 'المستودعات'], ['Control light and heat in large industrial spaces.', 'تحكم في الضوء والحرارة في المساحات الصناعية الكبيرة.']],
      [['Restaurants & cafés', 'المطاعم والمقاهي'], ['Comfort and privacy for dining areas.', 'راحة وخصوصية لمناطق الجلوس.']],
    ],
    faq: [
      [['Can you work outside business hours?', 'هل يمكنكم العمل خارج ساعات الدوام؟'], ['Yes. We schedule commercial installations around your operations to minimise disruption.', 'نعم. نجدول التركيبات التجارية بما يتناسب مع عملك لتقليل أي إزعاج.']],
      [['Do you offer one-way mirror film?', 'هل توفرون الأفلام العاكسة باتجاه واحد؟'], ['Yes — along with frosted designs, blackout films and stone protection films for marble and wood surfaces.', 'نعم — إلى جانب التصاميم المصنفرة وأفلام التعتيم وأفلام حماية الرخام والخشب.']],
      [['Do you handle large buildings?', 'هل تتعاملون مع المباني الكبيرة؟'], ['From single shops to multi-floor offices, we assess the site, recommend the right film and plan the installation in phases.', 'من المحلات الصغيرة إلى المكاتب متعددة الطوابق، نقيّم الموقع ونوصي بالفيلم المناسب ونخطط للتركيب على مراحل.']],
    ],
  },
  {
    slug: 'customized-cut-frosted-film',
    img: 'frosted',
    icon: 'frost',
    title: ['Customized Cut Frosted Film', 'أفلام مصنفرة بتصاميم مخصصة'],
    short: ['Design & privacy', 'التصميم والخصوصية'],
    summary: [
      'Custom-cut frosted patterns, logos and privacy bands that turn plain glass into a design feature.',
      'نقوش مصنفرة وشعارات وأشرطة خصوصية مقصوصة حسب الطلب تحوّل الزجاج العادي إلى عنصر تصميم.',
    ],
    headline: ['Privacy, drawn to your design.', 'خصوصية مرسومة على ذوقك.'],
    intro: [
      'Add a modern touch with customized cut frosted film — perfect for offices, clinics, showrooms and homes. Our frosted window designs enhance privacy and aesthetics, cut precisely to your pattern, logo or dimensions.',
      'أضف لمسة عصرية مع الأفلام المصنفرة المقصوصة حسب الطلب — مثالية للمكاتب والعيادات والمعارض والمنازل. تصاميمنا المصنفرة تعزز الخصوصية والجمال، وتُقص بدقة وفق نقشك أو شعارك أو مقاساتك.',
    ],
    whatIs: [
      'Frosted film gives glass an elegant etched-glass look at a fraction of the cost. We cut it to any pattern — geometric, floral, Islamic-inspired motifs, gradients or your brand logo — to create privacy exactly where you need it.',
      'يمنح الفيلم المصنفر الزجاج مظهر الزجاج المحفور الأنيق بتكلفة أقل بكثير. نقصّه بأي نقش — هندسي أو زهري أو مستوحى من الزخارف الإسلامية أو متدرج أو بشعار علامتك — لتحصل على الخصوصية حيث تحتاجها تماماً.',
    ],
    benefits: [
      [['Tailored privacy', 'خصوصية مخصصة'], ['Obscure exactly the areas you choose.', 'إخفاء المناطق التي تختارها بدقة.']],
      [['Brand presence', 'حضور للعلامة'], ['Logos and patterns that reinforce your identity.', 'شعارات ونقوش تعزز هويتك.']],
      [['Soft light', 'إضاءة ناعمة'], ['Diffuses daylight beautifully without blocking it.', 'ينشر ضوء النهار بنعومة دون حجبه.']],
      [['Safety visibility', 'وضوح للسلامة'], ['Manifestation bands on glass doors and partitions.', 'أشرطة تنبيه على الأبواب والقواطع الزجاجية.']],
      [['Removable', 'قابل للإزالة'], ['Update your design without replacing glass.', 'غيّر التصميم دون استبدال الزجاج.']],
      [['Cost-effective', 'اقتصادي'], ['Etched-glass elegance at a fraction of the price.', 'أناقة الزجاج المحفور بجزء من التكلفة.']],
    ],
    uses: [
      [['Office partitions', 'قواطع المكاتب'], ['Meeting rooms and private cabins.', 'غرف الاجتماعات والمكاتب الخاصة.']],
      [['Clinics', 'العيادات'], ['Consultation rooms and reception areas.', 'غرف الكشف ومناطق الاستقبال.']],
      [['Bathrooms', 'دورات المياه'], ['Privacy windows and shower glass.', 'نوافذ الخصوصية وزجاج الدش.']],
      [['Showrooms', 'المعارض'], ['Branded glass and decorative features.', 'زجاج يحمل العلامة وعناصر زخرفية.']],
    ],
    faq: [
      [['Can you cut my company logo?', 'هل يمكنكم قص شعار شركتي؟'], ['Yes. Send us your logo file and we’ll prepare a proof before cutting and installing.', 'نعم. أرسل لنا ملف الشعار وسنجهز نموذجاً للمراجعة قبل القص والتركيب.']],
      [['Is frosted film permanent?', 'هل الفيلم المصنفر دائم؟'], ['It’s long-lasting but removable, so you can refresh your design later without changing the glass.', 'يدوم طويلاً لكنه قابل للإزالة، فيمكنك تحديث التصميم لاحقاً دون تغيير الزجاج.']],
      [['Do you have ready-made patterns?', 'هل لديكم نقوش جاهزة؟'], ['We have a wide range of designs, or we can create a fully custom pattern for your space.', 'لدينا تشكيلة واسعة من التصاميم، أو نصمم لك نقشاً خاصاً بالكامل لمساحتك.']],
    ],
  },
  {
    slug: 'marble-protection-film',
    img: 'marble',
    icon: 'shield',
    title: ['Marble Protection Film', 'أفلام حماية الرخام'],
    short: ['Stone & wood surfaces', 'أسطح الحجر والخشب'],
    summary: [
      'Invisible film that guards marble, stone and wooden tables against scratches, stains and etching.',
      'فيلم شفاف يحمي الرخام والحجر والطاولات الخشبية من الخدوش والبقع والتآكل.',
    ],
    headline: ['Keep marble looking brand new.', 'رخام يبدو جديداً دائماً.'],
    intro: [
      'Protect your most valuable surfaces with marble and wooden table protection film. Our stone protection film prevents scratches, stains and acid etching — ideal for kitchens, dining tables, reception desks and vanities in homes and offices across Qatar.',
      'احمِ أثمن أسطحك مع أفلام حماية الرخام والطاولات الخشبية. يمنع فيلم حماية الحجر الخدوش والبقع وتآكل الأحماض — مثالي للمطابخ وطاولات الطعام ومكاتب الاستقبال والمغاسل في المنازل والمكاتب في جميع أنحاء قطر.',
    ],
    whatIs: [
      'A crystal-clear, self-adhesive protective layer applied over natural stone and wood. It takes the daily wear — coffee, lemon, wine, keys and cleaning chemicals — so the surface underneath stays flawless. Prevention costs far less than restoration.',
      'طبقة حماية شفافة تماماً ذاتية اللصق تُركّب على الحجر الطبيعي والخشب. تتحمل الاستخدام اليومي — القهوة والليمون والعصائر والمفاتيح ومواد التنظيف — ليبقى السطح تحتها مثالياً. الوقاية أقل تكلفة بكثير من الترميم.',
    ],
    benefits: [
      [['Stain resistance', 'مقاومة البقع'], ['Coffee, juice and oil wipe straight off.', 'القهوة والعصير والزيت تُمسح بسهولة.']],
      [['Etch protection', 'حماية من التآكل'], ['Shields marble from acidic spills like lemon and vinegar.', 'يحمي الرخام من الانسكابات الحمضية كالليمون والخل.']],
      [['Scratch guard', 'حماية من الخدوش'], ['Absorbs everyday scuffs and impacts.', 'يمتص الخدوش والصدمات اليومية.']],
      [['Invisible finish', 'لمسة غير مرئية'], ['Available in gloss or matte to match your stone.', 'متوفر بلمعة أو مطفي ليناسب الحجر.']],
      [['Easy maintenance', 'صيانة سهلة'], ['Simple cleaning with no special products.', 'تنظيف بسيط دون منتجات خاصة.']],
      [['Saves money', 'توفير المال'], ['Avoid costly polishing and restoration.', 'تجنب تكاليف التلميع والترميم الباهظة.']],
    ],
    uses: [
      [['Kitchen countertops', 'أسطح المطبخ'], ['The surface that takes the most abuse.', 'السطح الأكثر تعرضاً للاستخدام.']],
      [['Dining & coffee tables', 'طاولات الطعام والقهوة'], ['Marble and wooden tables stay pristine.', 'تبقى طاولات الرخام والخشب كالجديدة.']],
      [['Reception desks', 'مكاتب الاستقبال'], ['High-traffic counters in offices and hotels.', 'الكاونترات كثيرة الاستخدام في المكاتب والفنادق.']],
      [['Vanities', 'المغاسل'], ['Protection from cosmetics and cleaning products.', 'حماية من مستحضرات التجميل ومواد التنظيف.']],
    ],
    faq: [
      [['Will the film change how my marble looks?', 'هل سيغير الفيلم مظهر الرخام؟'], ['No. It’s optically clear and comes in gloss or matte finishes to match your stone.', 'لا. الفيلم شفاف تماماً ومتوفر بلمعة أو مطفي ليناسب الحجر.']],
      [['Can it go on wooden tables?', 'هل يمكن تركيبه على الطاولات الخشبية؟'], ['Yes — we protect wooden tables and furniture as well as marble and natural stone.', 'نعم — نحمي الطاولات والأثاث الخشبي إلى جانب الرخام والحجر الطبيعي.']],
      [['Is it heat resistant?', 'هل يتحمل الحرارة؟'], ['It handles everyday warm items, but we recommend trivets under very hot pots and pans.', 'يتحمل الأغراض الدافئة اليومية، لكننا ننصح باستخدام قاعدة تحت القدور الساخنة جداً.']],
    ],
  },
  {
    slug: 'fabric-nano-coating-service',
    img: 'nano',
    icon: 'drop',
    title: ['Fabric Nano Coating', 'طلاء النانو للأقمشة'],
    short: ['Sofas & carpets', 'الكنب والسجاد'],
    summary: [
      'An invisible nano shield that makes sofas, carpets and upholstery repel liquids and stains.',
      'درع نانو غير مرئي يجعل الكنب والسجاد والمفروشات تطرد السوائل والبقع.',
    ],
    headline: ['Spills simply roll away.', 'الانسكابات تنزلق بعيداً.'],
    intro: [
      'Safeguard your sofas, carpets and upholstery with nano coating from Exotic Tint Qatar. Our fabric nano coating creates an invisible shield that repels water, coffee, juice and oil — keeping your furniture fresh and long-lasting without changing its look or feel.',
      'احمِ الكنب والسجاد والمفروشات مع طلاء النانو من إكزوتك تينت قطر. يشكّل طلاء النانو للأقمشة درعاً غير مرئي يطرد الماء والقهوة والعصير والزيت — ليبقى أثاثك نظيفاً ويدوم طويلاً دون تغيير شكله أو ملمسه.',
    ],
    whatIs: [
      'Nano coating bonds microscopic particles to each fibre, creating a hydrophobic layer. Liquids bead up on the surface instead of soaking in, giving you time to simply blot them away. The fabric stays breathable, soft and true to colour.',
      'يربط طلاء النانو جزيئات متناهية الصغر بكل ليف من الألياف مكوّناً طبقة طاردة للماء. تتجمع السوائل على السطح كقطرات بدلاً من التغلغل، فتتمكن من مسحها بسهولة. ويبقى القماش قابلاً للتنفس وناعماً ومحافظاً على لونه.',
    ],
    benefits: [
      [['Liquid repellent', 'طارد للسوائل'], ['Water, juice and coffee bead up and wipe away.', 'الماء والعصير والقهوة تتجمع كقطرات وتُمسح بسهولة.']],
      [['Stain protection', 'حماية من البقع'], ['Prevents spills from setting into fibres.', 'يمنع الانسكابات من التغلغل في الألياف.']],
      [['Invisible', 'غير مرئي'], ['No change to colour, texture or softness.', 'لا يغير اللون أو الملمس أو النعومة.']],
      [['Breathable', 'قابل للتنفس'], ['Fabric stays comfortable and natural.', 'يبقى القماش مريحاً وطبيعياً.']],
      [['Family & pet friendly', 'مناسب للعائلة والحيوانات'], ['Peace of mind with kids and pets at home.', 'راحة بال مع الأطفال والحيوانات الأليفة في المنزل.']],
      [['Longer life', 'عمر أطول'], ['Keeps upholstery looking new for longer.', 'يحافظ على المفروشات جديدة لفترة أطول.']],
    ],
    uses: [
      [['Sofas & majlis', 'الكنب والمجالس'], ['The heart of every Qatari home.', 'قلب كل بيت قطري.']],
      [['Carpets & rugs', 'السجاد والموكيت'], ['High-traffic floors stay fresh.', 'أرضيات كثيرة الاستخدام تبقى نظيفة.']],
      [['Dining chairs', 'كراسي الطعام'], ['Where spills happen most.', 'حيث تحدث معظم الانسكابات.']],
      [['Car interiors', 'مقصورات السيارات'], ['Fabric seats protected from daily use.', 'حماية المقاعد القماشية من الاستخدام اليومي.']],
    ],
    faq: [
      [['Is nano coating safe?', 'هل طلاء النانو آمن؟'], ['Yes. Once cured it’s safe for everyday family use, including homes with children and pets.', 'نعم. بعد جفافه يصبح آمناً للاستخدام العائلي اليومي، بما في ذلك المنازل التي بها أطفال وحيوانات أليفة.']],
      [['Will it change how my sofa feels?', 'هل سيغير ملمس الكنب؟'], ['No. The coating is invisible and breathable — the fabric looks and feels the same.', 'لا. الطلاء غير مرئي وقابل للتنفس — يبقى القماش بنفس الشكل والملمس.']],
      [['How long does it last?', 'كم يدوم؟'], ['Protection lasts a long time with normal use; we’ll advise on care and re-application timing.', 'تدوم الحماية طويلاً مع الاستخدام العادي، وسننصحك بطريقة العناية وموعد إعادة التطبيق.']],
    ],
  },
];

const process = [
  [['Consultation', 'الاستشارة'], ['We understand your goals — heat, privacy, protection or design — and recommend the ideal film.', 'نفهم أهدافك — الحرارة أو الخصوصية أو الحماية أو التصميم — ونوصي بالفيلم المثالي.']],
  [['Site assessment', 'معاينة الموقع'], ['We measure your glass or surfaces and confirm a clear, flat-rate quote.', 'نقيس الزجاج أو الأسطح ونؤكد عرض سعر واضحاً وثابتاً.']],
  [['Preparation', 'التحضير'], ['Every surface is deep-cleaned for perfect, bubble-free adhesion.', 'يُنظف كل سطح بعمق لضمان التصاق مثالي خالٍ من الفقاعات.']],
  [['Precision install', 'تركيب دقيق'], ['Films are cut to fit and applied, sealed and smoothed by specialists.', 'تُقص الأفلام بالمقاس وتُركّب وتُثبت وتُنعّم على يد مختصين.']],
  [['Final inspection', 'الفحص النهائي'], ['We check clarity, edges and performance before handover.', 'نفحص الوضوح والحواف والأداء قبل التسليم.']],
];

const areas = [
  ['Doha', 'الدوحة'],
  ['Lusail', 'لوسيل'],
  ['The Pearl', 'اللؤلؤة'],
  ['West Bay', 'الخليج الغربي'],
  ['Al Rayyan', 'الريان'],
  ['Al Gharrafa', 'الغرافة'],
  ['Al Kheesa', 'الخيسة'],
  ['Al Wakra', 'الوكرة'],
];

const testimonials = [
  {
    name: 'Harold Harrison',
    role: ['Car owner', 'مالك سيارة'],
    service: ['Automotive tint', 'تظليل سيارة'],
    text: [
      'I used their car window tinting service, and the heat-rejection film keeps my car cool. Highly recommend Exotic Tint Qatar!',
      'استخدمت خدمة تظليل السيارات لديهم، والفيلم العازل للحرارة يُبقي سيارتي باردة. أنصح بشدة بإكزوتك تينت قطر!',
    ],
  },
  {
    name: 'Miranda Snyder',
    role: ['Office manager', 'مديرة مكتب'],
    service: ['Commercial & frosted', 'تجاري ومصنفر'],
    text: [
      'Exotic Tint Qatar provided excellent commercial window tinting in Doha. The frosted window film designs are perfect for our office, and the heat reduction is amazing!',
      'قدّمت إكزوتك تينت قطر خدمة ممتازة لتظليل مكتبنا في الدوحة. تصاميم الأفلام المصنفرة مثالية لمكتبنا، وتقليل الحرارة مذهل!',
    ],
  },
  {
    name: 'Debra Reyes',
    role: ['Homeowner', 'صاحبة منزل'],
    service: ['Nano coating & marble', 'نانو ورخام'],
    text: [
      'Their nano coating for sofa and marble protection services are incredible. My furniture and surfaces look brand new.',
      'خدمات طلاء النانو للكنب وحماية الرخام لديهم رائعة. أثاثي وأسطحي تبدو جديدة تماماً.',
    ],
  },
  {
    name: 'Omar S.',
    role: ['Office manager', 'مدير مكتب'],
    service: ['Commercial tint', 'تظليل تجاري'],
    text: [
      'Cooler offices and lower bills — great service from start to finish. The team was fast, clean and professional.',
      'مكاتب أبرد وفواتير أقل — خدمة رائعة من البداية للنهاية. الفريق سريع ونظيف ومحترف.',
    ],
  },
];

const homeFaq = [
  [['Which areas in Qatar do you cover?', 'ما المناطق التي تغطونها في قطر؟'], ['We install across Doha, Lusail, The Pearl, West Bay, Al Rayyan, Al Gharrafa, Al Kheesa, Al Wakra and surrounding areas — on-site at your home, office or parking spot.', 'نقوم بالتركيب في الدوحة ولوسيل واللؤلؤة والخليج الغربي والريان والغرافة والخيسة والوكرة والمناطق المحيطة — في منزلك أو مكتبك أو موقف سيارتك.']],
  [['How does pricing work?', 'كيف يتم التسعير؟'], ['Affordable, flat-rate pricing with no hidden fees. Send us photos or sizes on WhatsApp and we’ll reply with a free estimate.', 'أسعار مناسبة وثابتة دون رسوم خفية. أرسل لنا الصور أو المقاسات عبر واتساب وسنرد بتقدير مجاني.']],
  [['How much heat and UV does window film block?', 'كم تحجب الأفلام من الحرارة والأشعة؟'], ['Our films block 99% of UV rays, and premium automotive films reject up to 60% of solar heat. Exact performance depends on the film you choose.', 'تحجب أفلامنا ٩٩٪ من الأشعة فوق البنفسجية، وتصد أفلام السيارات الفاخرة حتى ٦٠٪ من حرارة الشمس. يعتمد الأداء الدقيق على نوع الفيلم الذي تختاره.']],
  [['What’s the difference between nano ceramic and regular tint?', 'ما الفرق بين النانو سيراميك والتظليل العادي؟'], ['Regular dyed tint mainly darkens glass. Nano ceramic films use ceramic particles to reject infrared heat without heavy darkening, don’t interfere with phone or GPS signals, and won’t fade or turn purple.', 'التظليل العادي يُعتم الزجاج بشكل أساسي. أما أفلام النانو سيراميك فتستخدم جزيئات سيراميكية لصد الحرارة دون تعتيم كبير، ولا تؤثر على إشارة الجوال أو الـ GPS، ولا تبهت أو يتغير لونها.']],
  [['Do you accept cashless payment?', 'هل تقبلون الدفع الإلكتروني؟'], ['Yes — secure, seamless cashless payments with flexible options for every service.', 'نعم — دفع إلكتروني آمن وسلس مع خيارات مرنة لكل خدمة.']],
  [['How quickly can you book me in?', 'متى يمكنكم الحجز لي؟'], ['Booking takes less than 60 seconds on WhatsApp, and we work 7 days a week from 8 AM to 6 PM.', 'يستغرق الحجز أقل من ٦٠ ثانية عبر واتساب، ونعمل ٧ أيام في الأسبوع من ٨ صباحاً حتى ٦ مساءً.']],
];

module.exports = { site, ui, services, process, areas, testimonials, homeFaq };
