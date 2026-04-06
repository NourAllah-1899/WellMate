/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const getHealth = (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'WellMate API is up and running 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
};
