import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function migrateExistingSellers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Import the compiled User model
        const UserModule = await import('./dist/models/User.js');
        const User = UserModule.default.default;

        // Find all sellers who don't have pickupAddress set
        const sellersWithoutPickup = await User.find({
            role: 'seller',
            pickupAddress: { $exists: false }
        });

        console.log(`Found ${sellersWithoutPickup.length} sellers without pickup address`);

        if (sellersWithoutPickup.length === 0) {
            console.log('No migration needed - all sellers have pickup addresses');
            return;
        }

        // For each seller without pickup address, we need to set a default or mark them as needing onboarding
        // Since we can't know their actual address, we'll mark onboardingCompleted as false
        // This forces them to re-complete onboarding to set their pickup address

        for (const seller of sellersWithoutPickup) {
            console.log(`Marking seller ${seller.name} (${seller.email}) as needing re-onboarding`);
            seller.onboardingCompleted = false;
            await seller.save();
        }

        console.log(`Migration complete. ${sellersWithoutPickup.length} sellers marked for re-onboarding.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the migration
migrateExistingSellers();