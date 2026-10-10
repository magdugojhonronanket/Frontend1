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

export default function HomeScreen() {
    const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
    const [selectedSpace, setSelectedSpace] = useState<any>(null);
    const [reservationMessage, setReservationMessage] = useState("");
    const [cancelMessage, setCancelMessage] = useState("");

    // Endpoint #1 - Get all parking spaces
    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/parking-spaces")
            .then((response) => {
                console.log("PARKING SPACES:", response.data);
                setParkingSpaces(response.data);
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
            });
    }, []);

    // Endpoint #2 - Get one parking space
    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/parking-spaces/1")
            .then((response) => {
                console.log("SINGLE PARKING SPACE:", response.data);
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
            });
    }, []);

    // Endpoint #3 - Create reservation
    const reserveParking = () => {
        axios
            .post("http://127.0.0.1:8000/api/reservations", {
                parking_space_id: selectedSpace?.id,
                name: "Charles",
                date: "2026-10-06",
                time: "10:00",
            })
            .then((response) => {
                console.log("RESERVATION CREATED:", response.data);
                setReservationMessage("Reservation created successfully!");
                setCancelMessage("");
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
            });
    };

    // Endpoint #4 - Get all reservations
    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/reservations")
            .then((response) => {
                console.log("RESERVATIONS:", response.data);
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
            });
    }, []);

    // Endpoint #5 - Cancel reservation
    const cancelReservation = () => {
        axios
            .delete("http://127.0.0.1:8000/api/reservations/1")
            .then((response) => {
                console.log("RESERVATION CANCELLED:", response.data);
                setCancelMessage("Reservation cancelled successfully!");
                setReservationMessage("");
            })
            .catch((error) => {
                console.log("API ERROR:", error.message);
                setCancelMessage("Failed to cancel reservation.");
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Parking Reservation</Text>

            {/* Endpoint #3 Button */}
            <Button
                title="Reserve Slot"
                onPress={reserveParking}
                disabled={!selectedSpace}
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

                        {selectedSpace && (
                            <Text>Selected: {selectedSpace.name}</Text>
                        )}

                        <Text>Location: {item.location}</Text>
                        <Text>Status: {item.status}</Text>
                    </TouchableOpacity>
                )}
            />

            <Text>{cancelMessage}</Text>
            <Button
                title="Cancel Reservation"
                onPress={cancelReservation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#f5f6fa",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#2d3436",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "600",
        marginVertical: 15,
    },
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
    cardSelected: {
        borderColor: "#0984e3",
        borderWidth: 2,
        backgroundColor: "#e8f4fd",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
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
    reserveBtn: {
        backgroundColor: "#0984e3",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelBtn: {
        backgroundColor: "#d63031",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    btnDisabled: { backgroundColor: "#b2bec3" },
    btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    successText: { color: "#00b894", marginTop: 8, fontWeight: "600" },
    cancelText: { color: "#d63031", marginTop: 8, fontWeight: "600" },
});