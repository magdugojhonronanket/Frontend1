import { useEffect, useState } from "react";
import {
    Text,
    View,
    FlatList,
    StyleSheet,
    Button,
    TouchableOpacity,
} from "react-native";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export default function HomeScreen() {
    const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<any>(null);
    const [reservationMessage, setReservationMessage] = useState("");
    const [cancelMessage, setCancelMessage] = useState("");

    // Endpoint #1 + #4 - Get all parking spaces and all reservations
    const loadData = async () => {
        try {
            const [spacesRes, reservationsRes] = await Promise.all([
                axios.get(`${API}/parking-spaces`),
                axios.get(`${API}/reservations`),
            ]);

            setParkingSpaces(spacesRes.data);
            setReservations(reservationsRes.data);

            // keep the selected slot in sync with the fresh status
            setSelectedSpace((prev: any) =>
                prev ? spacesRes.data.find((s: any) => s.id === prev.id) ?? null : null
            );
        } catch (error: any) {
            console.log("API ERROR:", error.message);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Endpoint #2 - Get one parking space
    useEffect(() => {
        axios
            .get(`${API}/parking-spaces/1`)
            .then((response) => {
                console.log("SINGLE PARKING SPACE:", response.data);
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
            });
    }, []);

    // Endpoint #3 - Create reservation
    const reserveParking = async () => {
        try {
            const response = await axios.post(`${API}/reservations`, {
                parking_space_id: selectedSpace?.id,
                name: "Charles",
                date: "2026-10-06",
                time: "10:00",
            });
            console.log("RESERVATION CREATED:", response.data);
            setReservationMessage("Reservation created successfully!");
            setCancelMessage("");
            await loadData(); // refresh status
        } catch (error: any) {
            console.log("API ERROR:", error.message);
            setReservationMessage(
                error.response?.data?.message ?? "Failed to reserve slot."
            );
            setCancelMessage("");
        }
    };

    // Endpoint #5 - Cancel reservation of the selected slot
    const cancelReservation = async () => {
        const reservation = reservations.find(
            (r) => r.parking_space_id === selectedSpace?.id
        );

        if (!reservation) {
            setCancelMessage("No reservation found for this slot.");
            setReservationMessage("");
            return;
        }

        try {
            const response = await axios.delete(`${API}/reservations/${reservation.id}`);
            console.log("RESERVATION CANCELLED:", response.data);
            setCancelMessage("Reservation cancelled successfully!");
            setReservationMessage("");
            await loadData(); // refresh status
        } catch (error: any) {
            console.log("API ERROR:", error.message);
            setCancelMessage("Failed to cancel reservation.");
        }
    };

    const isReserved = selectedSpace?.status === "reserved";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Parking Reservation</Text>

            <Button
                title="Reserve Slot"
                onPress={reserveParking}
                disabled={!selectedSpace || isReserved}
            />

            <Text>{reservationMessage}</Text>

            <Text style={styles.subtitle}>Available Parking Spaces</Text>

            <FlatList
                data={parkingSpaces}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.card,
                            selectedSpace?.id === item.id && styles.cardSelected,
                        ]}
                        onPress={() => setSelectedSpace(item)}
                    >
                        <Text style={styles.name}>{item.name}</Text>

                        {selectedSpace?.id === item.id && (
                            <Text>Selected: {item.name}</Text>
                        )}

                        <Text>Location: {item.location}</Text>
                        <Text
                            style={[
                                styles.status,
                                item.status === "available"
                                    ? styles.available
                                    : styles.unavailable,
                            ]}
                        >
                            {item.status}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <Text>{cancelMessage}</Text>
            <Button
                title="Cancel Reservation"
                onPress={cancelReservation}
                disabled={!selectedSpace || !isReserved}
            />
        </View>
    );
}

// styles: gamit gihapon ang imong existing StyleSheet (walay usab)
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#f5f6fa" },
    title: { fontSize: 28, fontWeight: "bold", marginBottom: 15, color: "#2d3436" },
    subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 15 },
    card: {
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#dfe6e9",
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: { borderColor: "#0984e3", borderWidth: 2, backgroundColor: "#e8f4fd" },
    name: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
    status: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        marginTop: 6,
        overflow: "hidden",
        color: "#fff",
        fontWeight: "600",
    },
    available: { backgroundColor: "#00b894" },
    unavailable: { backgroundColor: "#d63031" },
});
