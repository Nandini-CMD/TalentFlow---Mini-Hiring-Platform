// Initialize the app - setup MSW and seed data
import { worker, seedData } from './mock-api';

export async function initializeApp() {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    console.log('🔧 Starting MSW in development mode...');
    
    try {
      // Start MSW
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('✅ MSW started successfully');

      // Seed the database
      await seedData();
      console.log('✅ App initialization complete');

    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  }
}