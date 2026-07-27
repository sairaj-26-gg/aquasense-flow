import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle } from "react-leaflet";
import L from "leaflet";

import { LEAK_ALERTS, PIPELINES } from "@/lib/mock-data";

// Fix default icon issue with bundlers
const icon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:oklch(0.66 0.19 252);box-shadow:0 0 0 4px oklch(0.66 0.19 252 / 0.25);"></div>`,
});

const sevColors: Record<string, string> = {
  Critical: "oklch(0.65 0.24 25)",
  High: "oklch(0.78 0.17 65)",
  Medium: "oklch(0.78 0.17 65 / 0.7)",
  Low: "oklch(0.72 0.17 155)",
};

export default function MapView({ zone, severity }: { zone: string; severity: string }) {
  const pipes = PIPELINES.filter((p) => (zone === "All" ? true : p.zone === zone));
  const alerts = LEAK_ALERTS.filter(
    (a) =>
      (zone === "All" ? true : a.zone === zone) &&
      (severity === "All" ? true : a.severity === severity),
  );

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pipes.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div className="text-sm font-semibold">{p.code}</div>
              <div className="text-xs">{p.zone}</div>
              <div className="text-xs">
                Pressure {p.pressure} bar · Flow {p.flow} L/m
              </div>
              <div className="text-xs">Health {p.health}/100</div>
            </Popup>
          </Marker>
        ))}
        {alerts.map((a) => (
          <>
            <Circle
              key={`h-${a.id}`}
              center={[a.lat, a.lng]}
              radius={a.severity === "Critical" ? 500 : a.severity === "High" ? 350 : 220}
              pathOptions={{
                color: sevColors[a.severity],
                fillColor: sevColors[a.severity],
                fillOpacity: 0.2,
                weight: 0,
              }}
            />
            <CircleMarker
              key={a.id}
              center={[a.lat, a.lng]}
              radius={7}
              pathOptions={{ color: sevColors[a.severity], fillColor: sevColors[a.severity], fillOpacity: 1 }}
            >
              <Popup>
                <div className="text-sm font-semibold">{a.pipelineCode}</div>
                <div className="text-xs">{a.location}</div>
                <div className="text-xs">Severity: {a.severity}</div>
                <div className="text-xs">Est. loss: {a.estimatedLossLpm} L/min</div>
              </Popup>
            </CircleMarker>
          </>
        ))}
      </MapContainer>
    </div>
  );
}
