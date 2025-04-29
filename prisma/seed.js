import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting database seeding...");

    // Clean up existing data
    await cleanDatabase();

    // Create users
    const users = await createUsers();
    console.log(`Created ${users.length} users`);

    // Create categories
    const categories = await createCategories();
    console.log(`Created ${categories.length} categories`);

    // Create products
    const products = await createProducts(categories);
    console.log(`Created ${products.length} products`);

    // Create addresses for users
    const addresses = await createAddresses(users);
    console.log(`Created ${addresses.length} addresses`);

    // Create payment methods for users
    const paymentMethods = await createPaymentMethods(users);
    console.log(`Created ${paymentMethods.length} payment methods`);

    // Create carts for users
    const carts = await createCarts(users);
    console.log(`Created ${carts.length} carts`);

    // Create cart items
    const cartItems = await createCartItems(carts, products);
    console.log(`Created ${cartItems.length} cart items`);

    // Create orders
    const orders = await createOrders(users, products);
    console.log(`Created ${orders.length} orders`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanDatabase() {
  console.log("Cleaning up existing data...");

  // Delete in order to respect foreign key constraints
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
}

async function createUsers() {
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@digimart.com",
        password: hashedPassword,
        phone: "+1234567890",
        role: "ADMIN",
      },
    }),
    // Regular users
    prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: hashedPassword,
        phone: "+1987654321",
        role: "USER",
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: hashedPassword,
        phone: "+1122334455",
        role: "USER",
      },
    }),
  ]);

  return users;
}

async function createCategories() {
  // Create parent categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and gadgets",
      image: "/uploads/categories/electronics.jpg",
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      image: "/uploads/categories/clothing.jpg",
    },
  });

  const homeAndKitchen = await prisma.category.create({
    data: {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description: "Home appliances and kitchen essentials",
      image: "/uploads/categories/home-kitchen.jpg",
    },
  });

  // Create subcategories
  const smartphones = await prisma.category.create({
    data: {
      name: "Smartphones",
      slug: "smartphones",
      description: "Mobile phones and accessories",
      image: "/uploads/categories/smartphones.jpg",
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: "Laptops",
      slug: "laptops",
      description: "Notebooks and laptops",
      image: "/uploads/categories/laptops.jpg",
      parentId: electronics.id,
    },
  });

  const mensClothing = await prisma.category.create({
    data: {
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Clothing for men",
      image: "/uploads/categories/mens-clothing.jpg",
      parentId: clothing.id,
    },
  });

  const womensClothing = await prisma.category.create({
    data: {
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Clothing for women",
      image: "/uploads/categories/womens-clothing.jpg",
      parentId: clothing.id,
    },
  });

  const kitchenAppliances = await prisma.category.create({
    data: {
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      description: "Appliances for your kitchen",
      image: "/uploads/categories/kitchen-appliances.jpg",
      parentId: homeAndKitchen.id,
    },
  });

  return [electronics, clothing, homeAndKitchen, smartphones, laptops, mensClothing, womensClothing, kitchenAppliances];
}

async function createProducts(categories) {
  const conversionRate = 16000; // 1 USD = 16,000 IDR

  const toIDR = (usd) => (usd ? Math.round(usd * conversionRate) : null);

  const categoryMap = categories.reduce((map, category) => {
    map[category.name] = category;
    return map;
  }, {});

  const products = await Promise.all([
    // Smartphones
    prisma.product.create({
      data: {
        name: "iPhone 13 Pro",
        price: toIDR(999.99),
        oldPrice: toIDR(1099.99),
        description: "The latest iPhone with A15 Bionic chip, Pro camera system, and Super Retina XDR display with ProMotion.",
        image: "/uploads/products/iphone-13-pro.jpg",
        images: ["/uploads/products/iphone-13-pro-1.jpg", "/uploads/products/iphone-13-pro-2.jpg"],
        brand: "Apple",
        categoryId: categoryMap["Smartphones"].id,
        stock: 50,
        featured: true,
        isNewArrival: true,
        isBestSeller: true,
        specifications: {
          display: "6.1-inch Super Retina XDR display with ProMotion",
          chip: "A15 Bionic chip",
          camera: "Pro camera system with 12MP cameras",
          battery: "Up to 22 hours video playback",
          storage: "128GB, 256GB, 512GB, 1TB",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Samsung Galaxy S21",
        price: toIDR(799.99),
        oldPrice: toIDR(899.99),
        description: "5G smartphone with 8K video, Dynamic AMOLED display, and all-day battery life.",
        image: "/uploads/products/samsung-s21.jpg",
        images: ["/uploads/products/samsung-s21-1.jpg", "/uploads/products/samsung-s21-2.jpg"],
        brand: "Samsung",
        categoryId: categoryMap["Smartphones"].id,
        stock: 75,
        featured: true,
        isNewArrival: false,
        isBestSeller: true,
        specifications: {
          display: "6.2-inch Dynamic AMOLED 2X display",
          chip: "Exynos 2100 / Snapdragon 888",
          camera: "Triple camera with 12MP wide, 12MP ultrawide, 64MP telephoto",
          battery: "4000mAh",
          storage: "128GB, 256GB",
        },
      },
    }),
    // Laptops
    prisma.product.create({
      data: {
        name: "MacBook Pro 14-inch",
        price: toIDR(1999.99),
        oldPrice: null,
        description: "The most powerful MacBook Pro ever with M1 Pro or M1 Max chip, Liquid Retina XDR display, and up to 17 hours of battery life.",
        image: "/uploads/products/macbook-pro-14.jpg",
        images: ["/uploads/products/macbook-pro-14-1.jpg", "/uploads/products/macbook-pro-14-2.jpg"],
        brand: "Apple",
        categoryId: categoryMap["Laptops"].id,
        stock: 30,
        featured: true,
        isNewArrival: true,
        isBestSeller: false,
        specifications: {
          display: "14.2-inch Liquid Retina XDR display",
          chip: "Apple M1 Pro or M1 Max chip",
          memory: "16GB, 32GB, or 64GB unified memory",
          storage: "512GB, 1TB, 2TB, 4TB, or 8TB SSD",
          battery: "Up to 17 hours of battery life",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Dell XPS 15",
        price: toIDR(1499.99),
        oldPrice: toIDR(1699.99),
        description: "Powerhouse performance with 11th Gen Intel Core processors, NVIDIA graphics, and InfinityEdge display.",
        image: "/uploads/products/dell-xps-15.jpg",
        images: ["/uploads/products/dell-xps-15-1.jpg", "/uploads/products/dell-xps-15-2.jpg"],
        brand: "Dell",
        categoryId: categoryMap["Laptops"].id,
        stock: 25,
        featured: false,
        isNewArrival: true,
        isBestSeller: false,
        specifications: {
          display: "15.6-inch InfinityEdge display",
          processor: "11th Gen Intel Core i7-11800H",
          graphics: "NVIDIA GeForce RTX 3050 Ti",
          memory: "16GB DDR4",
          storage: "512GB SSD",
        },
      },
    }),
    // Men's Clothing
    prisma.product.create({
      data: {
        name: "Classic Fit Polo Shirt",
        price: toIDR(39.99),
        oldPrice: toIDR(49.99),
        description: "Comfortable cotton polo shirt with classic fit, perfect for casual wear.",
        image: "/uploads/products/polo-shirt.jpg",
        images: ["/uploads/products/polo-shirt-1.jpg", "/uploads/products/polo-shirt-2.jpg"],
        brand: "Ralph Lauren",
        categoryId: categoryMap["Men's Clothing"].id,
        stock: 100,
        featured: false,
        isNewArrival: false,
        isBestSeller: true,
        specifications: {
          material: "100% Cotton",
          fit: "Classic Fit",
          care: "Machine washable",
          sizes: "S, M, L, XL, XXL",
          colors: "Navy, Black, White, Red",
        },
      },
    }),
    // Women's Clothing
    prisma.product.create({
      data: {
        name: "Slim Fit Jeans",
        price: toIDR(59.99),
        oldPrice: null,
        description: "Stylish slim fit jeans with stretch denim for comfort and mobility.",
        image: "/uploads/products/slim-jeans.jpg",
        images: ["/uploads/products/slim-jeans-1.jpg", "/uploads/products/slim-jeans-2.jpg"],
        brand: "Levi's",
        categoryId: categoryMap["Women's Clothing"].id,
        stock: 80,
        featured: false,
        isNewArrival: true,
        isBestSeller: false,
        specifications: {
          material: "98% Cotton, 2% Elastane",
          fit: "Slim Fit",
          rise: "Mid Rise",
          care: "Machine washable",
          sizes: "24-34",
        },
      },
    }),
    // Kitchen Appliances
    prisma.product.create({
      data: {
        name: "Stand Mixer",
        price: toIDR(349.99),
        oldPrice: toIDR(399.99),
        description: "Powerful stand mixer with 10 speeds and multiple attachments for all your baking needs.",
        image: "/uploads/products/stand-mixer.jpg",
        images: ["/uploads/products/stand-mixer-1.jpg", "/uploads/products/stand-mixer-2.jpg"],
        brand: "KitchenAid",
        categoryId: categoryMap["Kitchen Appliances"].id,
        stock: 40,
        featured: true,
        isNewArrival: false,
        isBestSeller: true,
        specifications: {
          power: "325 watts",
          capacity: "5 quart",
          speeds: "10 speeds",
          attachments: "Flat beater, dough hook, wire whip",
          color: "Empire Red, Contour Silver, Onyx Black",
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Coffee Maker",
        price: toIDR(129.99),
        oldPrice: toIDR(149.99),
        description: "Programmable coffee maker with thermal carafe to keep your coffee hot for hours.",
        image: "/uploads/products/coffee-maker.jpg",
        images: ["/uploads/products/coffee-maker-1.jpg", "/uploads/products/coffee-maker-2.jpg"],
        brand: "Cuisinart",
        categoryId: categoryMap["Kitchen Appliances"].id,
        stock: 60,
        featured: false,
        isNewArrival: false,
        isBestSeller: true,
        specifications: {
          capacity: "12 cup",
          carafe: "Thermal stainless steel",
          programmable: "24-hour",
          features: "Brew strength control, auto shutoff",
          dimensions: '7.75" x 9" x 14"',
        },
      },
    }),
  ]);

  return products;
}


async function createAddresses(users) {
  const addresses = [];

  // Create addresses for each user
  for (const user of users) {
    addresses.push(
      await prisma.address.create({
        data: {
          userId: user.id,
          name: "Home",
          address: "123 Main St, Apt 4B",
          city: "New York, NY 10001",
          zipCode: "10001",
          isDefault: true,
        },
      })
    );

    addresses.push(
      await prisma.address.create({
        data: {
          userId: user.id,
          name: "Work",
          address: "456 Business Ave, Suite 200",
          city: "New York, NY 10002",
          zipCode: "10002",
          isDefault: false,
        },
      })
    );
  }

  return addresses;
}

async function createPaymentMethods(users) {
  const paymentMethods = [];

  // Create payment methods for each user
  for (const user of users) {
    paymentMethods.push(
      await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type: "CREDIT_CARD",
          details: {
            cardNumber: "**** **** **** 1234",
            cardHolder: `${user.firstName} ${user.lastName}`,
            expiryDate: "12/25",
            brand: "Visa",
          },
          isDefault: true,
        },
      })
    );

    paymentMethods.push(
      await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type: "BANK_TRANSFER",
          details: {
            bankName: "Chase Bank",
            accountNumber: "**** 5678",
            accountHolder: `${user.firstName} ${user.lastName}`,
          },
          isDefault: false,
        },
      })
    );
  }

  return paymentMethods;
}

async function createCarts(users) {
  const carts = [];

  // Create a cart for each user
  for (const user of users) {
    carts.push(
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      })
    );
  }

  return carts;
}

async function createCartItems(carts, products) {
  const cartItems = [];

  // Add items to the first user's cart
  cartItems.push(
    await prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: products[0].id,
        quantity: 1,
      },
    })
  );

  cartItems.push(
    await prisma.cartItem.create({
      data: {
        cartId: carts[0].id,
        productId: products[2].id,
        quantity: 1,
      },
    })
  );

  // Add items to the second user's cart
  if (carts.length > 1) {
    cartItems.push(
      await prisma.cartItem.create({
        data: {
          cartId: carts[1].id,
          productId: products[1].id,
          quantity: 2,
        },
      })
    );

    cartItems.push(
      await prisma.cartItem.create({
        data: {
          cartId: carts[1].id,
          productId: products[3].id,
          quantity: 1,
        },
      })
    );
  }

  return cartItems;
}

async function createOrders(users, products) {
  const orders = [];

  // Create orders for the first user
  const order1 = await prisma.order.create({
    data: {
      id: `ORD-${Date.now()}-1`,
      userId: users[0].id,
      subtotal: 999.99,
      shipping: 10.0,
      total: 1009.99,
      status: "COMPLETED",
      shippingAddress: {
        name: "Home",
        address: "123 Main St, Apt 4B",
        city: "New York, NY 10001",
        zipCode: "10001",
      },
      paymentMethod: "CREDIT_CARD",
      paymentStatus: "PAID",
      trackingNumber: "TRK123456789",
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            productImage: products[0].image,
            price: products[0].price,
            quantity: 1,
          },
        ],
      },
    },
  });

  orders.push(order1);

  // Create orders for the second user
  if (users.length > 1) {
    const order2 = await prisma.order.create({
      data: {
        id: `ORD-${Date.now()}-2`,
        userId: users[1].id,
        subtotal: 1599.98,
        shipping: 15.0,
        total: 1614.98,
        status: "PROCESSING",
        shippingAddress: {
          name: "Home",
          address: "456 Elm St, Apt 2C",
          city: "Brooklyn, NY 11201",
          zipCode: "11201",
        },
        paymentMethod: "CREDIT_CARD",
        paymentStatus: "PAID",
        items: {
          create: [
            {
              productId: products[1].id,
              productName: products[1].name,
              productImage: products[1].image,
              price: products[1].price,
              quantity: 2,
            },
          ],
        },
      },
    });

    orders.push(order2);
  }

  return orders;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
