import { db } from './src/lib/db';
import { tenants, categories, products, variants } from './src/lib/db/schemas';
import { eq } from 'drizzle-orm';

async function seedRobotics() {
  console.log('--- SEEDING ROBOTICS BD / ELECTRONICS TRADITIONAL STORE DATA ---');

  // 1. Get tenant
  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, 'shenzen-electronics')).limit(1);
  if (!tenant) {
    console.error('Tenant shenzen-electronics not found!');
    return;
  }

  // Update tenant storeConfig to match RoboticsBD BDT / Traditional exact look
  await db
    .update(tenants)
    .set({
      name: 'RoboticsBD — Discover Yourself',
      storeConfig: {
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        taxRatePercent: 0,
        freeShippingThresholdCents: 500000,
        features: {
          enableCod: true,
          enableBankTransfer: true,
          enableSandboxPay: true,
          enableWishlist: true,
          enableReviews: true,
        },
      },
    })
    .where(eq(tenants.id, tenant.id));

  // 2. Clear existing test products/categories for clean RoboticsBD catalog
  await db.delete(products).where(eq(products.tenantId, tenant.id));
  await db.delete(categories).where(eq(categories.tenantId, tenant.id));

  // 3. Insert 16 Traditional Menu Categories exactly matching RoboticsBD sidebar
  const categoryNames = [
    'Development Boards',
    'Raspberry Pi',
    'Mini Computer/ PC',
    '3D Printer',
    'Sensors',
    'Internet of things (IoT)',
    'Home Automation',
    'Learning Kit',
    'Electronics Module',
    'Arduino Shield',
    'Soldering Accessories',
    'Robotics Parts',
    'Quadcopter',
    'Instruments',
    'Tools & Accessories',
    'Battery & Charger',
  ];

  const categoryMap = new Map<string, string>();

  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [inserted] = await db
      .insert(categories)
      .values({
        tenantId: tenant.id,
        name,
        slug,
        description: `Explore top-quality ${name} with verified standard warranty and express delivery across Bangladesh.`,
      })
      .returning();
    categoryMap.set(name, inserted.id);
  }

  console.log(`Inserted ${categoryMap.size} categories.`);

  // 4. Insert 12 Realistic Electronics & Hardware Products with variants
  const itemsToInsert = [
    {
      categoryName: 'Mini Computer/ PC',
      title: 'NVIDIA Jetson Orin Nano Super Developer Kit',
      slug: 'nvidia-jetson-orin-nano-super-dev-kit',
      description: `Reference RBD-3255 | Brand: NVIDIA
• Powerful AI Performance: Up to 67 TOPS AI computing power.
• High-Performance Hardware: Features an Ampere GPU, 6-core ARM CPU.
• Flexible I/O & Expansion: Equipped with 4x USB 3.2 Gen2, 1x USB Type-C, 2x MIPI CSI-2 camera connectors.
• Broad Software & Ecosystem Support: Runs NVIDIA AI software stack.
• Ideal for Edge AI Applications: Optimized for robotics, AI-driven vision systems.
• Compact & Energy Efficient: 9-20V DC power input.

The NVIDIA Jetson Orin Nano Super Developer Kit comprises of a Jetson Orin Nano 8GB module and a carrier board that can accommodate all Orin Nano and Orin NX modules.`,
      priceInCents: 7895000, // BDT 78,950
      compareAtPriceInCents: 7995000, // Save BDT 1,000
      stockQuantity: 15,
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-3255',
      variants: [
        { title: 'Standard Kit (8GB Module + Carrier)', sku: 'RBD-3255-8GB', priceInCents: 7895000, stock: 15 },
      ],
    },
    {
      categoryName: '3D Printer',
      title: 'Creality Falcon2 40W Laser Engraver & Cutter',
      slug: 'creality-falcon2-40w-laser-engraver',
      description: `Mighty but Precise! Pro-tech for Pro-work.
• 40W Strong Laser Power: Effortlessly cuts 20mm wood and 1.5mm stainless steel in one pass.
• Adjustable Light Beam: Switch between 20W and 40W modes for fine detail or high-speed cutting.
• High Speed: Up to 25000mm/min engraving speed.
• Integrated Air Assist: Keeps edges clean and prevents scorch marks.
• Triple Monitoring System: Air flow, lens cleanliness, and flame sensor alerts.`,
      priceInCents: 9450000, // BDT 94,500
      compareAtPriceInCents: 9800000,
      stockQuantity: 8,
      images: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-FALCON40',
      variants: [
        { title: '40W Laser Combo + Enclosure', sku: 'FALCON-40W-COMBO', priceInCents: 9450000, stock: 8 },
      ],
    },
    {
      categoryName: 'Raspberry Pi',
      title: 'Raspberry Pi 5 8GB Single Board Computer',
      slug: 'raspberry-pi-5-8gb',
      description: `Featuring a 64-bit quad-core Arm Cortex-A76 processor running at 2.4GHz, Raspberry Pi 5 delivers a 2–3x increase in CPU performance relative to Raspberry Pi 4.
• 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU
• VideoCore VII GPU, supporting OpenGL ES 3.1, Vulkan 1.2
• Dual 4Kp60 HDMI display output with HDR support
• LPDDR4X-4267 SDRAM (8GB)
• Dual-band 802.11ac Wi-Fi & Bluetooth 5.0 / BLE`,
      priceInCents: 1150000, // BDT 11,500
      compareAtPriceInCents: 1200000,
      stockQuantity: 35,
      images: [
        'https://images.unsplash.com/photo-1608564697071-ddf911d81370?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-RPI5-8G',
      variants: [
        { title: '8GB RAM Board Only', sku: 'RPI5-8GB-STD', priceInCents: 1150000, stock: 35 },
        { title: '8GB + Official Active Cooler', sku: 'RPI5-8GB-COOL', priceInCents: 1230000, stock: 20 },
      ],
    },
    {
      categoryName: 'Development Boards',
      title: 'Arduino Mega 2560 R3 Development Board',
      slug: 'arduino-mega-2560-r3',
      description: `The Arduino Mega 2560 is a microcontroller board based on the ATmega2560. It has 54 digital input/output pins (of which 15 can be used as PWM outputs), 16 analog inputs, 4 UARTs (hardware serial ports), a 16 MHz crystal oscillator, a USB connection, a power jack, an ICSP header, and a reset button.`,
      priceInCents: 145000, // BDT 1,450
      compareAtPriceInCents: 160000,
      stockQuantity: 120,
      images: [
        'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-MEGA2560',
      variants: [
        { title: 'Original R3 with USB Cable', sku: 'MEGA2560-USB', priceInCents: 145000, stock: 120 },
      ],
    },
    {
      categoryName: 'Internet of things (IoT)',
      title: 'ESP32-S3-WROOM-1 Wi-Fi & Bluetooth 5 (LE) Module',
      slug: 'esp32-s3-wroom-1-module',
      description: `ESP32-S3 is a powerful, generic Wi-Fi + Bluetooth 5 (LE) MCU module built around the ESP32-S3 series of SoCs. On top of a rich set of peripherals, the acceleration for neural network computing and signal processing workloads provided by SoC makes the module an ideal choice for a wide variety of application scenarios related to AI and IoT (AIoT).`,
      priceInCents: 65000, // BDT 650
      compareAtPriceInCents: 75000,
      stockQuantity: 250,
      images: [
        'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-ESP32S3',
      variants: [
        { title: '16MB Flash / 8MB PSRAM', sku: 'ESP32S3-16M', priceInCents: 65000, stock: 250 },
      ],
    },
    {
      categoryName: 'Sensors',
      title: 'Ultrasonic Distance Sensor Module HC-SR04',
      slug: 'ultrasonic-distance-sensor-hc-sr04',
      description: `HC-SR04 ultrasonic distance sensor provides 2cm - 400cm non-contact measurement function, the ranging accuracy can reach to 3mm. The modules includes ultrasonic transmitters, receiver and control circuit.`,
      priceInCents: 12000, // BDT 120
      compareAtPriceInCents: 15000,
      stockQuantity: 500,
      images: [
        'https://images.unsplash.com/photo-1581092162384-8987c1d64718?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-HCSR04',
      variants: [
        { title: 'Single Module', sku: 'HCSR04-1X', priceInCents: 12000, stock: 500 },
      ],
    },
    {
      categoryName: 'Home Automation',
      title: 'Smart 4-Channel 5V Wi-Fi Relay Module for IoT',
      slug: 'smart-4-channel-wifi-relay-module',
      description: `Control up to 4 heavy household appliances using your smartphone or microcontroller over Wi-Fi. Compatible with Tuya, ESPHome, and Arduino/Raspberry Pi automation scripts.`,
      priceInCents: 85000, // BDT 850
      compareAtPriceInCents: 95000,
      stockQuantity: 85,
      images: [
        'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-RELAY4CH',
      variants: [
        { title: '4-Channel 5V Relay Board', sku: 'RELAY-4CH-5V', priceInCents: 85000, stock: 85 },
      ],
    },
    {
      categoryName: 'Instruments',
      title: 'Digital Multimeter DT-830D with Buzzer & Probe',
      slug: 'digital-multimeter-dt-830d',
      description: `DT-830D is a pocket-sized 3 1/2-digit digital multimeter for measuring DC and AC voltage, DC current, resistance, diode and continuity testing with audible buzzer.`,
      priceInCents: 45000, // BDT 450
      compareAtPriceInCents: 55000,
      stockQuantity: 140,
      images: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-DT830D',
      variants: [
        { title: 'Standard DT-830D Yellow', sku: 'DT830D-YEL', priceInCents: 45000, stock: 140 },
      ],
    },
    {
      categoryName: 'Tools & Accessories',
      title: 'Professional 60W Temperature Controlled Soldering Iron Station',
      slug: '60w-temperature-controlled-soldering-station',
      description: `Rapid heating soldering station with adjustable temperature range between 200°C to 480°C. ESD safe design with interchangeable precision ceramic tips.`,
      priceInCents: 245000, // BDT 2,450
      compareAtPriceInCents: 280000,
      stockQuantity: 45,
      images: [
        'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-SOLDER60W',
      variants: [
        { title: 'Station + 5 Tips Set', sku: 'SOLDER-60W-SET', priceInCents: 245000, stock: 45 },
      ],
    },
    {
      categoryName: 'Battery & Charger',
      title: 'XTAR VC4 Smart Universal Li-ion & Ni-MH Battery Charger',
      slug: 'xtar-vc4-smart-battery-charger',
      description: `Intelligent 4-slot charger with LCD gauge display showing charging voltage, current, and mAh capacity charged. Automatically recognizes 18650, 21700, AA, and AAA cells.`,
      priceInCents: 210000, // BDT 2,100
      compareAtPriceInCents: 235000,
      stockQuantity: 60,
      images: [
        'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-XTARVC4',
      variants: [
        { title: 'XTAR VC4 + USB Cable', sku: 'XTAR-VC4-STD', priceInCents: 210000, stock: 60 },
      ],
    },
    {
      categoryName: 'Robotics Parts',
      title: '4WD Smart Robot Car Chassis Kit with TT Motors & Wheels',
      slug: '4wd-smart-robot-car-chassis-kit',
      description: `Complete double-layer acrylic chassis kit with 4 high-torque DC gear motors, 4 rubber wheels, battery holder, and speed encoder discs for autonomous robotics experiments.`,
      priceInCents: 125000, // BDT 1,250
      compareAtPriceInCents: 140000,
      stockQuantity: 95,
      images: [
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-4WDCHASSIS',
      variants: [
        { title: 'Double Layer Acrylic Kit', sku: '4WD-CHASSIS-KIT', priceInCents: 125000, stock: 95 },
      ],
    },
    {
      categoryName: 'Quadcopter',
      title: 'F450 Quadcopter Drone Frame Kit with Landing Gear',
      slug: 'f450-quadcopter-drone-frame-kit',
      description: `High-strength glass fiber frame arms with integrated PCB wiring plates for easy soldering of ESCs and battery connectors. Perfect for DIY FPV and aerial photography builds.`,
      priceInCents: 135000, // BDT 1,350
      compareAtPriceInCents: 150000,
      stockQuantity: 70,
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop',
      ],
      sku: 'RBD-F450FRAME',
      variants: [
        { title: 'Red & White Frame + Tall Landing Skid', sku: 'F450-SKID-SET', priceInCents: 135000, stock: 70 },
      ],
    },
  ];

  for (const item of itemsToInsert) {
    const categoryId = categoryMap.get(item.categoryName) || categoryMap.values().next().value;
    const [insertedProd] = await db
      .insert(products)
      .values({
        tenantId: tenant.id,
        categoryId,
        title: item.title,
        handle: item.slug,
        description: item.description,
        status: 'published',
        images: item.images,
      })
      .returning();

    for (const [idx, v] of item.variants.entries()) {
      await db.insert(variants).values({
        productId: insertedProd.id,
        sku: v.sku || `${item.sku}-${idx + 1}`,
        title: v.title,
        priceInCents: v.priceInCents,
        compareAtPriceInCents: item.compareAtPriceInCents,
        stockQuantity: v.stock,
      });
    }
  }

  console.log('--- SEEDING COMPLETED SUCCESSFULLY! ---');
}

seedRobotics().then(() => process.exit(0)).catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
