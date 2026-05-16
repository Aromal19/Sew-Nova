import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sewnova_booking_v1";

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
	const [state, setState] = useState(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw
				? JSON.parse(raw)
				: {
					selectedFabricId: null,
					selectedTailorId: null,
					serviceType: "fabric-tailor",
					currentStep: 1,
				};
		} catch (_) {
			return {
				selectedFabricId: null,
				selectedTailorId: null,
				serviceType: "fabric-tailor",
				currentStep: 1,
			};
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch (_) {}
	}, [state]);

	const setSelectedFabric = (fabricId) =>
		setState((prev) => ({ ...prev, selectedFabricId: fabricId }));

	const setSelectedTailor = (tailorId) =>
		setState((prev) => ({ ...prev, selectedTailorId: tailorId }));

	const setServiceType = (serviceType) =>
		setState((prev) => ({ ...prev, serviceType }));

	const setCurrentStep = (step) => setState((prev) => ({ ...prev, currentStep: step }));

	const clearBooking = () =>
		setState({ selectedFabricId: null, selectedTailorId: null, serviceType: "fabric-tailor", currentStep: 1 });

	const value = useMemo(
		() => ({ state, setSelectedFabric, setSelectedTailor, setServiceType, setCurrentStep, clearBooking }),
		[state]
	);

	return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
	const ctx = useContext(BookingContext);
	if (!ctx) throw new Error("useBooking must be used within BookingProvider");
	return ctx;
};


