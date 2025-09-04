const { User, Store, Rating } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await Rating.destroy({ where: {} });
    await Store.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('Existing data cleared.');

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator User',
      email: 'admin@example.com',
      address: '123 Admin Street, Admin City, AC 12345',
      password: 'AdminPass123!',
      role: 'admin'
    });
    console.log('Admin user created:', adminUser.email);

    // Create multiple store owners
    const storeOwners = await User.bulkCreate([
      {
        name: 'Ganesh Adapnor',
        email: 'ganesh@store.com',
        address: '456 Business Avenue, Commerce City, CC 67890',
        password: 'StorePass123!',
        role: 'store_owner'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@store.com',
        address: '789 Retail Road, Shopping District, SD 54321',
        password: 'StorePass123!',
        role: 'store_owner'
      },
      {
        name: 'Michael Chen',
        email: 'michael@store.com',
        address: '321 Market Street, Business Center, BC 98765',
        password: 'StorePass123!',
        role: 'store_owner'
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily@store.com',
        address: '654 Plaza Avenue, Downtown, DT 13579',
        password: 'StorePass123!',
        role: 'store_owner'
      }
    ]);
    console.log('Store owners created:', storeOwners.length);

    // Create normal users
    const normalUsers = await User.bulkCreate([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        address: '789 Residential Road, Home Town, HT 11111',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        address: '321 Main Street, Downtown, DT 22222',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        address: '555 Oak Street, Suburbia, SB 33333',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        address: '777 Pine Avenue, Riverside, RS 44444',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Eva Martinez',
        email: 'eva@example.com',
        address: '999 Elm Drive, Hillside, HS 55555',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Frank Wilson',
        email: 'frank@example.com',
        address: '111 Cedar Lane, Valley View, VV 66666',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Grace Lee',
        email: 'grace@example.com',
        address: '333 Maple Street, Garden District, GD 77777',
        password: 'UserPass123!',
        role: 'user'
      },
      {
        name: 'Henry Taylor',
        email: 'henry@example.com',
        address: '222 Birch Road, Park Side, PS 88888',
        password: 'UserPass123!',
        role: 'user'
      }
    ]);
    console.log('Normal users created:', normalUsers.length);

    // Create diverse stores
    const stores = await Store.bulkCreate([
      // Ganesh's stores
      {
        name: 'Tech Gadgets Hub',
        email: 'tech@ganeshstore.com',
        address: '100 Technology Drive, Tech City, TC 33333',
        ownerId: storeOwners[0].id
      },
      {
        name: 'Coffee Corner Express',
        email: 'coffee@ganeshstore.com',
        address: '200 Brewery Lane, Coffee Town, CT 44444',
        ownerId: storeOwners[0].id
      },
      {
        name: 'Electronics World',
        email: 'electronics@ganeshstore.com',
        address: '300 Digital Plaza, Tech District, TD 55555',
        ownerId: storeOwners[0].id
      },
      
      // Sarah's stores
      {
        name: 'Fashion Forward',
        email: 'fashion@sarahstore.com',
        address: '400 Style Street, Fashion District, FD 66666',
        ownerId: storeOwners[1].id
      },
      {
        name: 'Beauty Boutique',
        email: 'beauty@sarahstore.com',
        address: '500 Glamour Avenue, Beauty Center, BC 77777',
        ownerId: storeOwners[1].id
      },
      
      // Michael's stores
      {
        name: 'Fresh Market Grocery',
        email: 'grocery@michaelstore.com',
        address: '600 Fresh Lane, Market Square, MS 88888',
        ownerId: storeOwners[2].id
      },
      {
        name: 'Sports Zone',
        email: 'sports@michaelstore.com',
        address: '700 Athletic Drive, Sports Complex, SC 99999',
        ownerId: storeOwners[2].id
      },
      
      // Emily's stores
      {
        name: 'Book Nook',
        email: 'books@emilystore.com',
        address: '800 Literary Lane, Reading District, RD 10101',
        ownerId: storeOwners[3].id
      },
      {
        name: 'Home Decor Plus',
        email: 'homedecor@emilystore.com',
        address: '900 Design Drive, Interior Plaza, IP 20202',
        ownerId: storeOwners[3].id
      },
      {
        name: 'Garden Center',
        email: 'garden@emilystore.com',
        address: '1000 Green Street, Nature District, ND 30303',
        ownerId: storeOwners[3].id
      }
    ]);
    console.log('Stores created:', stores.length);

    // Create comprehensive ratings
    const ratings = await Rating.bulkCreate([
      // Tech Gadgets Hub ratings
      {
        userId: normalUsers[0].id,
        storeId: stores[0].id,
        rating: 5,
        comment: 'Excellent service and great products! The staff is very knowledgeable about tech gadgets.'
      },
      {
        userId: normalUsers[1].id,
        storeId: stores[0].id,
        rating: 4,
        comment: 'Good selection, friendly staff. Prices are reasonable for the quality.'
      },
      {
        userId: normalUsers[2].id,
        storeId: stores[0].id,
        rating: 5,
        comment: 'Best tech store in the city! They have everything I need.'
      },
      {
        userId: normalUsers[3].id,
        storeId: stores[0].id,
        rating: 3,
        comment: 'Decent store but could improve customer service.'
      },
      
      // Coffee Corner Express ratings
      {
        userId: normalUsers[0].id,
        storeId: stores[1].id,
        rating: 5,
        comment: 'Best coffee in town! The baristas are amazing and the atmosphere is perfect.'
      },
      {
        userId: normalUsers[1].id,
        storeId: stores[1].id,
        rating: 3,
        comment: 'Decent coffee, but a bit expensive. Good for meetings though.'
      },
      {
        userId: normalUsers[4].id,
        storeId: stores[1].id,
        rating: 4,
        comment: 'Great coffee and pastries. Love the cozy atmosphere.'
      },
      {
        userId: normalUsers[5].id,
        storeId: stores[1].id,
        rating: 5,
        comment: 'Perfect place to work remotely. Fast WiFi and excellent coffee.'
      },
      
      // Electronics World ratings
      {
        userId: normalUsers[2].id,
        storeId: stores[2].id,
        rating: 4,
        comment: 'Good selection of electronics. Staff could be more helpful.'
      },
      {
        userId: normalUsers[3].id,
        storeId: stores[2].id,
        rating: 5,
        comment: 'Found exactly what I was looking for. Great prices and service.'
      },
      {
        userId: normalUsers[6].id,
        storeId: stores[2].id,
        rating: 3,
        comment: 'Average store. Nothing special but gets the job done.'
      },
      
      // Fashion Forward ratings
      {
        userId: normalUsers[4].id,
        storeId: stores[3].id,
        rating: 5,
        comment: 'Love the latest fashion trends here! Great selection and helpful staff.'
      },
      {
        userId: normalUsers[5].id,
        storeId: stores[3].id,
        rating: 4,
        comment: 'Good quality clothes. A bit pricey but worth it for the style.'
      },
      {
        userId: normalUsers[6].id,
        storeId: stores[3].id,
        rating: 4,
        comment: 'Nice store with trendy clothes. Good customer service.'
      },
      
      // Beauty Boutique ratings
      {
        userId: normalUsers[0].id,
        storeId: stores[4].id,
        rating: 5,
        comment: 'Amazing beauty products! The staff really knows their stuff.'
      },
      {
        userId: normalUsers[4].id,
        storeId: stores[4].id,
        rating: 4,
        comment: 'Great selection of cosmetics. Love the natural products.'
      },
      {
        userId: normalUsers[7].id,
        storeId: stores[4].id,
        rating: 3,
        comment: 'Good store but limited selection of men\'s products.'
      },
      
      // Fresh Market Grocery ratings
      {
        userId: normalUsers[1].id,
        storeId: stores[5].id,
        rating: 5,
        comment: 'Fresh produce and great prices. My go-to grocery store.'
      },
      {
        userId: normalUsers[3].id,
        storeId: stores[5].id,
        rating: 4,
        comment: 'Good variety of organic products. Clean and well-organized.'
      },
      {
        userId: normalUsers[5].id,
        storeId: stores[5].id,
        rating: 4,
        comment: 'Convenient location and friendly staff. Good quality products.'
      },
      {
        userId: normalUsers[7].id,
        storeId: stores[5].id,
        rating: 3,
        comment: 'Decent grocery store but could have better parking.'
      },
      
      // Sports Zone ratings
      {
        userId: normalUsers[2].id,
        storeId: stores[6].id,
        rating: 5,
        comment: 'Perfect for all my sports needs! Great equipment and knowledgeable staff.'
      },
      {
        userId: normalUsers[6].id,
        storeId: stores[6].id,
        rating: 4,
        comment: 'Good selection of sports gear. Helpful staff for recommendations.'
      },
      {
        userId: normalUsers[7].id,
        storeId: stores[6].id,
        rating: 4,
        comment: 'Great store for fitness equipment. Good prices and quality.'
      },
      
      // Book Nook ratings
      {
        userId: normalUsers[0].id,
        storeId: stores[7].id,
        rating: 5,
        comment: 'Heaven for book lovers! Cozy atmosphere and great selection.'
      },
      {
        userId: normalUsers[3].id,
        storeId: stores[7].id,
        rating: 4,
        comment: 'Love the quiet reading area. Good selection of books.'
      },
      {
        userId: normalUsers[5].id,
        storeId: stores[7].id,
        rating: 5,
        comment: 'Perfect place to find rare books. Staff is very helpful.'
      },
      
      // Home Decor Plus ratings
      {
        userId: normalUsers[1].id,
        storeId: stores[8].id,
        rating: 4,
        comment: 'Great selection of home decor items. Good quality and prices.'
      },
      {
        userId: normalUsers[4].id,
        storeId: stores[8].id,
        rating: 5,
        comment: 'Beautiful home decor! Found exactly what I needed for my living room.'
      },
      {
        userId: normalUsers[6].id,
        storeId: stores[8].id,
        rating: 3,
        comment: 'Nice store but a bit expensive. Good quality though.'
      },
      
      // Garden Center ratings
      {
        userId: normalUsers[2].id,
        storeId: stores[9].id,
        rating: 5,
        comment: 'Best garden center in town! Great plants and expert advice.'
      },
      {
        userId: normalUsers[5].id,
        storeId: stores[9].id,
        rating: 4,
        comment: 'Good selection of plants and gardening tools. Helpful staff.'
      },
      {
        userId: normalUsers[7].id,
        storeId: stores[9].id,
        rating: 4,
        comment: 'Love the variety of plants. Great for my garden project.'
      }
    ]);
    console.log('Ratings created:', ratings.length);

    console.log('Database seeding completed successfully!');
    console.log('\n=== DEMO ACCOUNTS ===');
    console.log('Admin: admin@example.com / AdminPass123!');
    console.log('Store Owner: ganesh@store.com / StorePass123!');
    console.log('Normal Users: alice@example.com, bob@example.com, carol@example.com / UserPass123!');
    console.log('\n=== STORE OWNERS ===');
    console.log('Ganesh Adapnor: 3 stores (Tech, Coffee, Electronics)');
    console.log('Sarah Wilson: 2 stores (Fashion, Beauty)');
    console.log('Michael Chen: 2 stores (Grocery, Sports)');
    console.log('Emily Rodriguez: 3 stores (Books, Home Decor, Garden)');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedDatabase;
