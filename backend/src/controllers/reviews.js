const ReviewModel = require('../schemas/reviews');


let GetProductReviews = async function (productId) {
    return await ReviewModel
        .find({ productId: productId, isDeleted: false })
        .populate('userId', 'username avatar')
        .sort({ createdAt: -1 });
};


let CreateReview = async function (data, session) {
    const review = new ReviewModel(data);
    return await review.save({ session });
};


let CalculateProductRating = async function (productId, session) {
    const stats = await ReviewModel.aggregate([
        { 
            $match: { 
                productId: productId, 
                isDeleted: false 
            } 
        },
        {
            $group: {
                _id: '$productId',
                numReviews: { $sum: 1 },
                rating: { $avg: '$rating' }
            }
        }
    ]).session(session); 

    if (stats.length > 0) {
        return {
            numReviews: stats[0].numReviews,
            rating: Math.round(stats[0].rating * 10) / 10 
        };
    } else {
        return { numReviews: 0, rating: 0 };
    }
};

module.exports = {
    GetProductReviews,
    CreateReview,
    CalculateProductRating
};
