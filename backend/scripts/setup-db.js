const { sequelize } = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Force sync only for initial setup (drops and recreates tables)
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully.');
    
    console.log('Database setup completed!');
    console.log('You can now run "npm run seed" to populate with demo data.');
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
