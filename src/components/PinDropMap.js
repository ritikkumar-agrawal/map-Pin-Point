import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './PinDropMap.css';

const PinDropMap = () => {
    const [pins, setPins] = useState(JSON.parse(localStorage.getItem('pins')) || []);
    const [selectedPin, setSelectedPin] = useState(null);

    useEffect(() => {
        localStorage.setItem('pins', JSON.stringify(pins));
    }, [pins]);

    const DropPin = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                const remark = prompt("Enter remarks for this pin:");
                if (remark) {
                    const newPin = { lat, lng, remark, address: '' };
                    fetchAddress(newPin);
                }
            },
        });
        return null;
    };

    const fetchAddress = async (pin) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat: pin.lat,
                    lon: pin.lng,
                    format: 'json',
                },
            });
            pin.address = response.data.display_name || 'Address not found';
        } catch {
            pin.address = 'Address not found';
        }
        setPins((prevPins) => [...prevPins, pin]);
    };

    const mapRef = React.useRef();
    useEffect(() => {
        if (selectedPin && mapRef.current) {
            const map = mapRef.current;
            map.setView([selectedPin.lat, selectedPin.lng], 13);
        }
    }, [selectedPin]);

    return (
        <div className="map-container">
            <div className="map">
                <MapContainer center={[20, 78]} zoom={4} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <DropPin />
                    {pins.map((pin, index) => (
                        <Marker
                            key={index}
                            position={[pin.lat, pin.lng]}
                            eventHandlers={{
                                click: () => setSelectedPin(pin),
                            }}
                        >
                            <Popup>
                                <b>Remarks:</b> {pin.remark} <br />
                                <b>Address:</b> {pin.address}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
            {/* // Code for sidebar */}
            <div id="sidebar">
                <h3>Saved Pins</h3>
                {pins.length > 0 ? (
                    pins.map((pin, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedPin(pin)}
                            style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
                        >
                            <b>Remarks:</b> {pin.remark} <br />
                            <b>Latitude:</b> {pin.lat} <br />
                            <b>Longitude:</b> {pin.lng} <br />
                            <b>Address:</b> {pin.address}
                        </div>
                    ))
                ) : (
                    <p>No pins saved yet.</p>
                )}
            </div>

            {/* // end of code for sidebar */}

        </div>
    );
};

export default PinDropMap;
