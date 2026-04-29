createBookingPage({
    tiers: ['ECONOMY', 'COMFORT', 'BUSINESS', 'PREMIUM'],
    defaultTier: 'ECONOMY',
    priceEndpoint: '/api/prices/hire',
    isReady: ({ startInput, endInput }) => Boolean(startInput.value && endInput.value),
    pricePayload: ({ startInput, endInput, car }) => ({
        start: startInput.value,
        hireEnd: endInput.value,
        carId: car.id
    }),
    bookingPayload: ({ state, startInput, endInput }) => ({
        bookingType: 'HIRE',
        userId: state.userId,
        carId: state.selectedCar.id,
        timeStart: startInput.value,
        hireEnd: endInput.value,
        status: 'CREATED'
    })
});
