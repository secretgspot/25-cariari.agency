// Get GPS
export const getPosition = async (property, gps) => {
	if (navigator.geolocation) {
		const optionsHighAccuracy = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		};
		const optionsLowAccuracy = {
			enableHighAccuracy: false,
			timeout: 5000,
			maximumAge: 0,
		};

		// Try with high accuracy first
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				console.log('📍 High Accuracy:', pos);
				property.location.lat = pos.coords.latitude;
				property.location.lng = pos.coords.longitude;
				if (typeof gps === 'function') {
					gps(pos.coords);
				}
			},
			(err) => {
				console.warn('💩 High Accuracy Error:', err);
				if (err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) {
					console.log('Retrying with low accuracy...');
					// If high accuracy fails, try with low accuracy
					navigator.geolocation.getCurrentPosition(
						(pos) => {
							console.log('📍 Low Accuracy:', pos);
							property.location.lat = pos.coords.latitude;
							property.location.lng = pos.coords.longitude;
							if (typeof gps === 'function') {
								gps(pos.coords);
							}
						},
						(errLow) => console.warn('💩 Low Accuracy Error:', errLow),
						optionsLowAccuracy,
					);
				} else {
					// Handle other errors like PERMISSION_DENIED
					console.log('📍 Geolocation Error:', err.message);
				}
			},
			optionsHighAccuracy,
		);
	} else {
		console.log('YOUR BROWSER DOESN"T SUPPORT GEOLOCATION'); // Corrected typo
	}
}