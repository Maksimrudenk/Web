createBookingPage({
    tiers: ['ECONOMY', 'COMFORT', 'BUSINESS', 'PREMIUM'],
    locations: ['CITY_CENTRE', 'SUBURB', 'AIRPORT'],
    defaultTier: 'ECONOMY',
    priceEndpoint: '/api/prices/trip',
    isReady: ({ startInput, pickupInput, destinationInput }) => Boolean(startInput.value && pickupInput.value && destinationInput.value),
    pricePayload: ({ pickupInput, destinationInput, car }) => ({
        pickupLocation: pickupInput.value,
        destination: destinationInput.value,
        carId: car.id
    }),
    bookingPayload: ({ state, startInput, pickupInput, destinationInput }) => ({
        bookingType: 'TRIP',
        userId: state.userId,
        carId: state.selectedCar.id,
        timeStart: startInput.value,
        status: 'CREATED',
        pickupLocation: pickupInput.value,
        destination: destinationInput.value
    })
});
