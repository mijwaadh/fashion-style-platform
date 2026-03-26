import { Request, Response } from 'express';
import User from '../models/User';

// @POST /api/seller-onboard/verify-tax
// Simulates verification of GSTIN or Enrollment ID
export const verifyTaxDetails = async (req: any, res: Response) => {
    try {
        const { taxType, taxId } = req.body;
        // taxType could be 'GSTIN' or 'ENROLLMENT_ID'

        if (!taxId || !taxType) {
            return res.status(400).json({ message: 'Tax type and ID are required.' });
        }

        // Extremely basic format validation for simulation
        // In real world, this would call GSTN or govt API
        if (taxType === 'GSTIN' && taxId.length !== 15) {
            return res.status(400).json({ message: 'Invalid GSTIN length. Must be 15 characters.' });
        }
        
        if (taxType === 'ENROLLMENT_ID' && taxId.length < 10) {
            return res.status(400).json({ message: 'Invalid Enrollment ID length.' });
        }

        // Return a mocked successful response
        return res.json({ 
            message: 'Verification successful',
            verified: true,
            details: {
                taxId: taxId,
                status: 'Active'
            }
        });

    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/seller-onboard/complete
// Save all collected wizard data and mark onboarding as complete
export const completeOnboarding = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const {
            taxType, 
            taxId, 
            pickupAddress, 
            businessType, 
            agreedToSupplierTerms,
            storeName,
            name,
            email // allow seller to update their core contact email and name
        } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can access this.' });

        // Validate basic requirements
        if (!agreedToSupplierTerms) {
            return res.status(400).json({ message: 'You must agree to the Supplier Agreement.' });
        }

        // Update fields
        if (taxType === 'GSTIN') user.gstin = taxId;
        if (taxType === 'ENROLLMENT_ID') user.enrollmentId = taxId;
        
        if (pickupAddress) user.pickupAddress = pickupAddress;
        if (businessType) user.businessType = businessType;
        user.agreedToSupplierTerms = true;
        
        if (storeName) user.storeName = storeName;
        if (name) user.name = name;
        if (email) user.email = email;

        // Mark as fully onboarded
        user.onboardingCompleted = true;

        await user.save();

        // Return user to client so AuthContext can update locally
        return res.status(200).json({
            message: 'Onboarding completed successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeName: user.storeName,
                onboardingCompleted: user.onboardingCompleted
            }
        });

    } catch (err: any) {
        console.error('[ONBOARDING_ERROR]', err);
        return res.status(500).json({ message: err.message || 'Failed to complete onboarding' });
    }
};
