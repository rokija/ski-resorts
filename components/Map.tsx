import { MapContainer, Marker, TileLayer, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { divIcon } from "leaflet";
import styles from "./map.module.css";

const MountainSvg = () => (
  <svg x="0" y="0" viewBox="0 0 24 24" width="20" height="20">
    <g>
      <g>
        <g>
          <path
            fill="inherit"
            opacity={0.8}
            d="M7.134,11.081c-0.364-0.4-0.91-0.364-1.164,0.109L0.074,22.981C-0.144,23.454,0.183,24,0.693,24h8.188     c0.255,0,0.509-0.146,0.619-0.4C11.283,19.961,10.227,14.393,7.134,11.081z"
          />
          <path
            fill="inherit"
            d="M11.429,0.382c-3.275,5.204-3.057,10.99-0.91,15.321c2.183,4.331,3.821,7.679,3.967,7.897     c0.109,0.255,0.364,0.4,0.619,0.4h8.188c0.509,0,0.873-0.546,0.619-1.019c0,0-11.027-22.053-11.318-22.599     C12.375-0.127,11.756-0.127,11.429,0.382z"
          />
        </g>
      </g>
    </g>
  </svg>
);

const container = document.createElement("div");
const root = createRoot(container);

flushSync(() => {
  root.render(<MountainSvg />);
});

const isClosedIcon = divIcon({
  html: container.innerHTML,
  className: styles.isClosedIcon,
});

const isOpenIcon = divIcon({
  html: container.innerHTML,
  className: styles.isOpenIcon,
});

const isOpenSoonIcon = divIcon({
  html: container.innerHTML,
  className: styles.isOpenSoonIcon,
});

export type Resort = {
  name: string;
  lat: number;
  lng: number;
  homepage?: string;
  piste?: string;
};

export const ResortsMap = ({ resorts }: { resorts: Resort[] }) => {
  const first = resorts[0];

  return (
    <MapContainer
      center={[Number(first.lat), Number(first.lng)]}
      zoom={6}
      scrollWheelZoom={false}
      style={{ height: 600, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {resorts.map((el) => {
        const isOpen = el?.piste?.includes("snow");
        const isOpenSoon = el?.piste?.includes("opens");

        return (
          <Marker
            icon={
              isOpenSoon ? isOpenSoonIcon : isOpen ? isOpenIcon : isClosedIcon
            }
            key={el.name}
            position={[el.lat, el.lng]}
          >
            <Popup>
              <div className={styles.resortName}>{el.name}</div>
              <a href={el.homepage} className={styles.homepage}>
                {el.homepage}
              </a>
            </Popup>
            <Tooltip>{el.name}</Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export const LoadingMap = () => {
  return <div className={styles.loadingMap}>The map is loading...</div>;
};
